import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { createUserSchema, validateBody } from '@/lib/validations';

// GET - Retrieve all users (admin) or filtered list
export async function GET(request: Request) {
  const { error, user: authUser } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: any = { deletedAt: null };
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - Create a new user (admin only)
export async function POST(request: Request) {
  const { error, user: authUser } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(createUserSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const { name, email, password, role, category, attributes, status, avatar } = validation.data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Email "${email}" sudah terdaftar.` },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth first
    const rawPassword = password || '123456';
    const supabaseAdmin = createSupabaseAdminClient();
    const { error: sbError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: rawPassword,
      email_confirm: true,
      user_metadata: { name, role: role || 'voter', category: category || '' },
    });

    if (sbError && !sbError.message?.includes('already been registered')) {
      return NextResponse.json(
        { success: false, message: `Gagal membuat akun auth: ${sbError.message}` },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: 'supabase_auth_managed',
      role: role || 'voter',
      category: category || '',
      attributes: attributes || {},
      status: status || 'active',
      avatar: avatar || '',
    });

    await AuditLog.create({
      userId: authUser!._id.toString(),
      userName: authUser!.name,
      action: 'TAMBAH_PENGGUNA',
      description: `Menambahkan pengguna baru: "${user.name}" (${user.role})`,
      resource: 'PENGGUNA',
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
