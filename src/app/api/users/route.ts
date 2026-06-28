import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';

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

    const filter: any = {};
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
  const { error } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, role, category, attributes, status, avatar } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Nama dan email wajib diisi.' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Email "${email}" sudah terdaftar.` },
        { status: 409 }
      );
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role: role || 'voter',
      category: category || '',
      attributes: attributes || {},
      status: status || 'active',
      avatar: avatar || '',
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
