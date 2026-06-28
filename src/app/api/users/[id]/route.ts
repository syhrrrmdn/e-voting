import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import VoteRecord from '@/models/VoteRecord';
import AuditLog from '@/models/AuditLog';

// GET - Get single user by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const user = await User.findOne({ _id: id, deletedAt: null }).select('-passwordHash');

    if (!user) {
      return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT - Update user (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: authUser } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Prevent changing own role
    if (authUser && authUser._id.toString() === id && body.role) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak dapat mengubah role akun Anda sendiri.' },
        { status: 400 }
      );
    }

    const updateData = { ...body };
    if (body.password) {
      const crypto = require('crypto');
      updateData.passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    await AuditLog.create({
      userId: authUser!._id.toString(),
      userName: authUser!.name,
      action: 'UBAH_PENGGUNA',
      description: `Mengubah data pengguna: "${user.name}" (${user.email})`,
      resource: 'PENGGUNA',
    });

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Remove user (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: authUser } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    // Prevent self-deletion
    if (authUser && authUser._id.toString() === id) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ _id: id, deletedAt: null });
    if (!user) {
      return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Soft delete: set deletedAt timestamp
    await User.findByIdAndUpdate(id, { deletedAt: new Date() });

    await AuditLog.create({
      userId: authUser!._id.toString(),
      userName: authUser!.name,
      action: 'HAPUS_PENGGUNA',
      description: `Menghapus pengguna: "${user.name}" (${user.email})`,
      resource: 'PENGGUNA',
    });

    return NextResponse.json({ success: true, message: 'Pengguna berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
