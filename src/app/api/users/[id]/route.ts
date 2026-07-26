import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import VoteRecord from '@/models/VoteRecord';
import AuditLog from '@/models/AuditLog';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { updateUserSchema, validateBody } from '@/lib/validations';

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
    const user = await User.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    if (user.passwordHash) delete user.passwordHash;

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

    // Zod validation
    const validation = validateBody(updateUserSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // Prevent changing own role
    if (authUser && authUser._id.toString() === id && validation.data.role) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak dapat mengubah role akun Anda sendiri.' },
        { status: 400 }
      );
    }

    const updateData: any = { ...validation.data };
    if (updateData.password && String(updateData.password).trim() !== '') {
      // Sync password to Supabase Auth
      const targetUser = await User.findById(id);
      if (targetUser) {
        const supabaseAdmin = createSupabaseAdminClient();
        const { data: sbUsers } = await supabaseAdmin.auth.admin.listUsers();
        const sbUser = sbUsers?.users?.find((u: any) => u.email === targetUser.email);
        if (sbUser) {
          await supabaseAdmin.auth.admin.updateUserById(sbUser.id, {
            password: updateData.password,
          });
        }
      }
    }
    delete updateData.password;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    if (user.passwordHash) delete user.passwordHash;

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
