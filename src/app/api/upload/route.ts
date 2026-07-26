import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAuthUser } from '@/lib/auth';
import { uploadSchema, validateBody } from '@/lib/validations';

export async function POST(request: Request) {
  const { error, user } = await getAuthUser(['admin', 'election_admin', 'voter']);
  if (error) return error;

  try {
    const body = await request.json();

    // Zod validation
    const validation = validateBody(uploadSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const { file, folder } = validation.data;

    // Verify Cloudinary credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Kredensial Cloudinary belum diatur di server. Silakan lengkapi file .env' 
        },
        { status: 500 }
      );
    }

    const result = await uploadToCloudinary(file, folder);

    if (result.success) {
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        message: 'Berkas berhasil diunggah ke Cloudinary!'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Gagal mengunggah ke Cloudinary', error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal server', error: error.message },
      { status: 500 }
    );
  }
}
