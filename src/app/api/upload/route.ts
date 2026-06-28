import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { file, folder } = await request.json();

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File (base64 string) harus disertakan' },
        { status: 400 }
      );
    }

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

    const result = await uploadToCloudinary(file, folder || 'e-voting');

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
