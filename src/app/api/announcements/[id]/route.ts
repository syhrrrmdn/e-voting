import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import Announcement from '@/models/Announcement';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { updateAnnouncementSchema, validateBody } from '@/lib/validations';

// PUT - Update an announcement
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Zod validation
    const validation = validateBody(updateAnnouncementSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const existing = await Announcement.findOne({ _id: id, deletedAt: null });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Pengumuman tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updateData: any = { ...validation.data };
    if (updateData.isPinned !== undefined) {
      updateData.isPinned = Boolean(updateData.isPinned);
    }

    const updated = await Announcement.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Soft-delete an announcement
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const existing = await Announcement.findOne({ _id: id, deletedAt: null });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Pengumuman tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Clean up Cloudinary image if present
    if (existing.imageUrl) {
      try {
        await deleteFromCloudinary(existing.imageUrl);
      } catch (cloudErr) {
        console.warn('Gagal menghapus gambar pengumuman dari Cloudinary:', cloudErr);
      }
    }

    await Announcement.findByIdAndUpdate(id, { deletedAt: new Date() });

    return NextResponse.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
