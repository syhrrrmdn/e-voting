import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token dan kata sandi baru wajib diisi.' },
        { status: 400 }
      );
    }

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

    // Set new password hash
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    user.passwordHash = hash;
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
