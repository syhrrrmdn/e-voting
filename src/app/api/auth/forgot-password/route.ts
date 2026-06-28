import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), deletedAt: null });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Alamat email tidak terdaftar di sistem.' },
        { status: 404 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    // Construct Reset URL
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${origin}/reset-password?token=${token}`;

    try {
      // Send real SMTP email
      await sendResetPasswordEmail(user.email, resetLink);
    } catch (mailErr: any) {
      console.error('Mail send error:', mailErr);
      // Fallback: Return error response so client knows SMTP failed
      return NextResponse.json(
        { success: false, message: `Gagal mengirim email: ${mailErr.message}. Tautan debug: /reset-password?token=${token}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tautan reset kata sandi telah dikirim ke email Anda.',
      devResetLink: `/reset-password?token=${token}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
