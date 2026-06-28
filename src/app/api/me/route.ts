import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET - Get current authenticated user's profile from DB
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: 'Tidak terautentikasi.' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT - Update own profile (name, avatar)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: 'Tidak terautentikasi.' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const body = await request.json();

    // Only allow updating name and avatar for own profile
    const allowedFields: any = {};
    if (body.name) allowedFields.name = body.name;
    if (body.avatar !== undefined) allowedFields.avatar = body.avatar;

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      allowedFields,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Pengguna tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
