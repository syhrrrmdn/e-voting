import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import DynamicAttribute from '@/models/DynamicAttribute';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';

// PUT - Update an attribute
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const attribute = await DynamicAttribute.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!attribute) {
      return NextResponse.json({ success: false, message: 'Atribut tidak ditemukan.' }, { status: 404 });
    }

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'UBAH_ATRIBUT',
      description: `Mengubah atribut dinamis: "${attribute.label}"`,
      resource: 'ATRIBUT',
    });

    return NextResponse.json({ success: true, data: attribute });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Remove an attribute
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const attribute = await DynamicAttribute.findOne({ _id: id, deletedAt: null });

    if (!attribute) {
      return NextResponse.json({ success: false, message: 'Atribut tidak ditemukan.' }, { status: 404 });
    }

    // Soft delete: set deletedAt timestamp
    await DynamicAttribute.findByIdAndUpdate(id, { deletedAt: new Date() });

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'HAPUS_ATRIBUT',
      description: `Menghapus atribut dinamis: "${attribute.label}"`,
      resource: 'ATRIBUT',
    });

    return NextResponse.json({ success: true, message: 'Atribut berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
