import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import AuditLog from '@/models/AuditLog';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// PUT - Update candidate
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const existingCandidate = await Candidate.findOne({ _id: id, deletedAt: null });
    if (!existingCandidate) {
      return NextResponse.json({ success: false, message: 'Kandidat tidak ditemukan.' }, { status: 404 });
    }

    // Auto delete old Cloudinary image if a new image URL is provided and differs
    if (body.image && existingCandidate.image && body.image !== existingCandidate.image) {
      try {
        await deleteFromCloudinary(existingCandidate.image);
      } catch (cloudErr) {
        console.warn('Gagal menghapus gambar lama dari Cloudinary:', cloudErr);
      }
    }

    const candidate = await Candidate.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'UBAH_KANDIDAT',
      description: `Mengubah data kandidat "${existingCandidate.name}"`,
      resource: 'KANDIDAT',
    });

    return NextResponse.json({ success: true, data: candidate });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Remove candidate
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const candidate = await Candidate.findOne({ _id: id, deletedAt: null });
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Kandidat tidak ditemukan.' }, { status: 404 });
    }

    // Delete image from Cloudinary
    if (candidate.image) {
      try {
        await deleteFromCloudinary(candidate.image);
      } catch (cloudErr) {
        console.warn('Gagal menghapus gambar kandidat dari Cloudinary:', cloudErr);
      }
    }

    // Remove candidate ref from election
    await Election.findByIdAndUpdate(candidate.electionId, {
      $pull: { candidates: candidate._id },
    });

    // Soft delete: set deletedAt timestamp
    await Candidate.findByIdAndUpdate(id, { deletedAt: new Date() });

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'HAPUS_KANDIDAT',
      description: `Menghapus kandidat "${candidate.name}"`,
      resource: 'KANDIDAT',
    });

    return NextResponse.json({ success: true, message: 'Kandidat berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
