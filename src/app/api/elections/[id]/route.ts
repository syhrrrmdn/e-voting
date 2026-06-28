import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import VoteRecord from '@/models/VoteRecord';
import AuditLog from '@/models/AuditLog';

// GET - Get single election by ID (with populated candidates)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const election = await Election.findOne({ _id: id, deletedAt: null }).populate({ path: 'candidates', match: { deletedAt: null } });

    if (!election) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }

    const doc = election.toObject();
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

    // Prevent editing closed elections
    const existing = await Election.findOne({ _id: id, deletedAt: null });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }
    if (existing.status === 'closed' && body.status !== 'closed') {
      return NextResponse.json(
        { success: false, message: 'Pemilihan yang sudah ditutup tidak dapat diedit.' },
        { status: 400 }
      );
    }

    const election = await Election.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate({ path: 'candidates', match: { deletedAt: null } });

    // Audit log
    let auditAction = 'UBAH_PEMILIHAN';
    let auditDesc = `Mengubah data pemilihan: "${existing.title}"`;
    let details: any = undefined;

    if (body.status && body.status !== existing.status) {
      auditAction = 'UBAH_STATUS_PEMILIHAN';
      auditDesc = `Mengubah status pemilihan "${existing.title}" dari ${existing.status.toUpperCase()} menjadi ${body.status.toUpperCase()}`;
      details = { before: existing.status, after: body.status };
    } else if (body.rules) {
      auditAction = 'UBAH_ATURAN_PEMILIH';
      auditDesc = `Memperbarui aturan pemilih untuk pemilihan: "${existing.title}"`;
      details = { before: existing.rules, after: body.rules };
    } else {
      const diff: any = {};
      const fields = ['title', 'description', 'startTime', 'endTime'];
      fields.forEach(f => {
        if (body[f] !== undefined && String(body[f]) !== String((existing as any)[f])) {
          diff[f] = { before: (existing as any)[f], after: body[f] };
        }
      });
      if (Object.keys(diff).length > 0) {
        details = diff;
      }
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
    if (election.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Hanya pemilihan berstatus draft yang dapat dihapus.' },
        { status: 400 }
      );
    }

    // Soft delete: mark election and its candidates as deleted
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
