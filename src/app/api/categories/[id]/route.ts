import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import UserCategory from '@/models/UserCategory';
import DynamicAttribute from '@/models/DynamicAttribute';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';

// PUT - Update a category
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

    // Don't allow changing the key to prevent orphaning attribute references
    const { label, description } = body;

    const category = await UserCategory.findByIdAndUpdate(
      id,
      { label, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    await AuditLog.create({
      userId: authUser!._id.toString(),
      userName: authUser!.name,
      action: 'UBAH_KATEGORI',
      description: `Mengubah kategori: "${category.label}"`,
      resource: 'KATEGORI',
    });

    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Remove a category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: authUser } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const category = await UserCategory.findOne({ _id: id, deletedAt: null });
    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    // Soft delete: set deletedAt timestamp
    await UserCategory.findByIdAndUpdate(id, { deletedAt: new Date() });

    await AuditLog.create({
      userId: authUser!._id.toString(),
      userName: authUser!.name,
      action: 'HAPUS_KATEGORI',
      description: `Menghapus kategori: "${category.label}"`,
      resource: 'KATEGORI',
    });

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
