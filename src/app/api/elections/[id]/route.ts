import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import VoteRecord from '@/models/VoteRecord';
import AuditLog from '@/models/AuditLog';
import { canAccessElection } from '@/lib/accessControl';
import { updateElectionSchema, validateBody } from '@/lib/validations';

// GET - Get single election by ID (with candidates from Candidate table)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const election = await Election.findOne({ _id: id, deletedAt: null });

    if (!election) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }

    // Category-based access check for election_admin
    if (!canAccessElection(user, election)) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak memiliki akses ke pemilihan ini.' },
        { status: 403 }
      );
    }

    const doc = election.toObject ? election.toObject() : election;

    // Fetch candidates via Candidate.electionId (single source of truth)
    const candidates = await Candidate.find({ electionId: doc._id || doc.id, deletedAt: null });
    doc.candidates = candidates.map((c: any) => c.toObject ? c.toObject() : c);

    if (doc.status !== 'closed') {
      doc.totalVotes = 0;
      if (Array.isArray(doc.candidates)) {
        doc.candidates = doc.candidates.map((c: any) => ({ ...c, voteCount: 0 }));
      }
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT - Update election (admin or election_admin)
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
    const validation = validateBody(updateElectionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // Prevent editing closed elections
    const existing = await Election.findOne({ _id: id, deletedAt: null });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }

    // Category-based access check for election_admin
    if (!canAccessElection(user, existing)) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak memiliki akses untuk mengubah pemilihan ini.' },
        { status: 403 }
      );
    }

    if (existing.status === 'closed' && validation.data.status !== 'closed') {
      return NextResponse.json(
        { success: false, message: 'Pemilihan yang sudah ditutup tidak dapat diedit.' },
        { status: 400 }
      );
    }

    const updatePayload: any = { ...validation.data };
    // Never allow updating creator metadata via PUT
    delete updatePayload.createdById;
    delete updatePayload.creatorCategory;
    delete updatePayload.creatorAttributes;

    const election = await Election.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    // Audit log
    let auditAction = 'UBAH_PEMILIHAN';
    let auditDesc = `Mengubah data pemilihan: "${existing.title}"`;
    let details: any = undefined;

    if (validation.data.status && validation.data.status !== existing.status) {
      auditAction = 'UBAH_STATUS_PEMILIHAN';
      auditDesc = `Mengubah status pemilihan "${existing.title}" dari ${existing.status.toUpperCase()} menjadi ${validation.data.status.toUpperCase()}`;
      details = { before: existing.status, after: validation.data.status };
    } else if (validation.data.rules) {
      auditAction = 'UBAH_ATURAN_PEMILIH';
      auditDesc = `Memperbarui aturan pemilih untuk pemilihan: "${existing.title}"`;
      details = { before: existing.rules, after: validation.data.rules };
    }

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: auditAction,
      description: auditDesc,
      resource: 'PEMILIHAN',
      details,
    });

    return NextResponse.json({ success: true, data: election });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Delete election (admin or election_admin, draft only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const election = await Election.findOne({ _id: id, deletedAt: null });
    if (!election) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }

    // Category-based access check for election_admin
    if (!canAccessElection(user, election)) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak memiliki akses untuk menghapus pemilihan ini.' },
        { status: 403 }
      );
    }

    if (election.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Hanya pemilihan berstatus draft yang dapat dihapus.' },
        { status: 400 }
      );
    }

    // Soft delete: mark election and its candidates as deleted & cleanup images from Cloudinary
    const candidates = await Candidate.find({ electionId: id, deletedAt: null });
    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    for (const cand of candidates) {
      if (cand.image) {
        try {
          await deleteFromCloudinary(cand.image);
        } catch (cErr) {
          console.warn('Gagal menghapus gambar kandidat dari Cloudinary:', cErr);
        }
      }
    }

    const now = new Date();
    await Candidate.updateMany({ electionId: id, deletedAt: null }, { deletedAt: now });
    await Election.findByIdAndUpdate(id, { deletedAt: now });

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'HAPUS_PEMILIHAN',
      description: `Menghapus pemilihan: "${election.title}"`,
      resource: 'PEMILIHAN',
    });

    return NextResponse.json({ success: true, message: 'Pemilihan berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
