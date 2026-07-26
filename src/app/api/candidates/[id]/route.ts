import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import AuditLog from '@/models/AuditLog';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { canAccessElection } from '@/lib/accessControl';
import { updateCandidateSchema, validateBody } from '@/lib/validations';

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

    // Zod validation
    const validation = validateBody(updateCandidateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const existingCandidate = await Candidate.findOne({ _id: id, deletedAt: null });
    if (!existingCandidate) {
      return NextResponse.json({ success: false, message: 'Kandidat tidak ditemukan.' }, { status: 404 });
    }

    // Access check: election_admin must match election's category + attributes
    const election = await Election.findOne({ _id: existingCandidate.electionId, deletedAt: null });
    if (election) {
      if (!canAccessElection(user, election)) {
        return NextResponse.json(
          { success: false, message: 'Anda tidak memiliki akses untuk mengubah kandidat pada pemilihan ini.' },
          { status: 403 }
        );
      }
    }

    // Auto delete old Cloudinary image if a new image URL is provided and differs
    if (validation.data.image && existingCandidate.image && validation.data.image !== existingCandidate.image) {
      try {
        await deleteFromCloudinary(existingCandidate.image);
      } catch (cloudErr) {
        console.warn('Gagal menghapus gambar lama dari Cloudinary:', cloudErr);
      }
    }

    const candidate = await Candidate.findByIdAndUpdate(id, validation.data, {
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

    // Access check: election_admin must match election's category + attributes
    const election = await Election.findOne({ _id: candidate.electionId, deletedAt: null });
    if (election) {
      if (!canAccessElection(user, election)) {
        return NextResponse.json(
          { success: false, message: 'Anda tidak memiliki akses untuk menghapus kandidat pada pemilihan ini.' },
          { status: 403 }
        );
      }
    }

    // Delete image from Cloudinary
    if (candidate.image) {
      try {
        await deleteFromCloudinary(candidate.image);
      } catch (cloudErr) {
        console.warn('Gagal menghapus gambar kandidat dari Cloudinary:', cloudErr);
      }
    }

    // NOTE: No longer removing from Election.candidates array (single source of truth is Candidate.electionId)

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
