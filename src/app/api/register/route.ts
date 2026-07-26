import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { validateBody, registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
    }
    const { name, email, password, category, attributes } = validation.data;

    await dbConnect();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user already exists in local DB
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' },
        { status: 409 }
      );
    }

    // 2. Create user in Supabase Auth (primary auth source)
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true, // Auto-confirm for internal system
      user_metadata: { name, role: 'voter', category },
    });

    if (authError) {
      // If user already exists in Supabase Auth, still create local record
      if (!authError.message?.includes('already been registered')) {
        return NextResponse.json(
          { success: false, message: `Gagal membuat akun: ${authError.message}` },
          { status: 400 }
        );
      }
    }

    // 3. Create user in application database (profile table)
    const newUser = await User.create({
      name,
      email: cleanEmail,
      passwordHash: 'supabase_auth_managed', // Password managed by Supabase Auth
      role: 'voter',
      category: category || '',
      attributes: attributes || {},
      status: 'active',
      avatar: '',
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      data: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('[Register Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
