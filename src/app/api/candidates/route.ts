import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';

// GET - Get candidates for an election
export async function GET(request: Request) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    const filter: any = {};
    if (electionId) filter.electionId = electionId;

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: candidates });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - Add candidate to an election
export async function POST(request: Request) {
  const { error } = await getAuthUser(['admin', 'election_admin']);
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

    const election = await Election.findById(electionId);
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

    return NextResponse.json({ success: true, data: candidate }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
