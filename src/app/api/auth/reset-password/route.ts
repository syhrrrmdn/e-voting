import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { resetPasswordSchema, validateBody } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(resetPasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
      deletedAt: null,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token reset tidak valid atau telah kedaluwarsa.' },
        { status: 400 }
      );
    }

    // Update password in Supabase Auth
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: sbUsers } = await supabaseAdmin.auth.admin.listUsers();
    const sbUser = sbUsers?.users?.find((u: any) => u.email === user.email);
    if (sbUser) {
      await supabaseAdmin.auth.admin.updateUserById(sbUser.id, { password });
    }

    // Clear reset token
    user.passwordHash = 'supabase_auth_managed';
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Kata sandi Anda berhasil diperbarui. Silakan masuk kembali.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
