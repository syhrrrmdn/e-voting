import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import AuditLog from '@/models/AuditLog';

// GET - Get candidates for an election
export async function GET(request: Request) {
  const { error, user } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    const filter: any = { deletedAt: null };
    if (electionId) filter.electionId = electionId;

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });

    // Fetch election statuses to mask candidates belonging to open elections
    const electionIds = Array.from(new Set(candidates.map(c => c.electionId.toString())));
    const elections = await Election.find({ _id: { $in: electionIds } });
    const closedMap: Record<string, boolean> = {};
    elections.forEach(e => {
      closedMap[e._id.toString()] = e.status === 'closed';
    });

    let formatted: any = candidates.map(c => {
      const doc = c.toObject();
      if (!closedMap[doc.electionId.toString()]) {
        doc.voteCount = 0;
      }
      return doc;
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - Add candidate to an election
export async function POST(request: Request) {
  const { error, user } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();
    const { name, description, image, electionId } = body;

    if (!name || !electionId) {
      return NextResponse.json(
        { success: false, message: 'Nama kandidat dan ID pemilihan harus diisi.' },
        { status: 400 }
      );
    }

    const election = await Election.findOne({ _id: electionId, deletedAt: null });
    if (!election) {
      return NextResponse.json(
        { success: false, message: 'Pemilihan tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (election.status !== 'draft' && election.status !== 'published') {
      return NextResponse.json(
        { success: false, message: 'Kandidat hanya bisa ditambahkan pada pemilihan berstatus draft atau published.' },
        { status: 400 }
      );
    }

    const candidate = await Candidate.create({
      name,
      description: description || '',
      image: image || '',
      electionId,
      voteCount: 0,
    });

    // Add candidate ref to election
    election.candidates.push(candidate._id);
    await election.save();

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'TAMBAH_KANDIDAT',
      description: `Menambahkan kandidat "${candidate.name}" pada pemilihan: "${election.title}"`,
      resource: 'KANDIDAT',
    });

    return NextResponse.json({ success: true, data: candidate }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
