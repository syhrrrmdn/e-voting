import nodemailer from 'nodemailer';
import dbConnect from './mongodb';
import SystemSettings from '@/models/SystemSettings';

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  let appName = 'MudaVote';
  try {
    await dbConnect();
    const settings = await SystemSettings.findOne();
    if (settings && settings.appName) {
      appName = settings.appName;
    }
  } catch (dbErr) {
    console.error('Gagal mengambil appName dari settings untuk email:', dbErr);
  }

  const initials = appName.substring(0, 2).toUpperCase();
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || `"${appName}" <no-reply@mudavote.ac.id>`;

  if (!host || !user || !pass) {
    console.warn('Konfigurasi SMTP tidak lengkap. Email tidak dapat dikirim.');
    throw new Error('Konfigurasi SMTP server belum lengkap di file .env.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to: email,
    subject: `Atur Ulang Kata Sandi Anda - ${appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); color: white; padding: 12px 18px; border-radius: 12px; font-weight: 900; font-size: 20px; letter-spacing: -0.5px;">
            ${initials}
          </div>
          <h2 style="color: #1e293b; margin-top: 15px; font-size: 22px; font-weight: 800;">${appName}</h2>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi untuk akun ${appName} Anda yang terdaftar pada email <strong>${email}</strong>.</p>
        <p>Silakan klik tombol di bawah ini untuk mengatur ulang kata sandi Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Atur Ulang Kata Sandi</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Tautan di atas hanya berlaku selama <strong>1 jam</strong> dari sekarang. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dengan aman.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">${appName} &copy; ${new Date().getFullYear()}. Seluruh hak cipta dilindungi.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
