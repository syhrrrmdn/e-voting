import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import AuditLog from '@/models/AuditLog';

// GET - Retrieve all elections with optional filters
export async function GET(request: Request) {
  const { error, user } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const filter: any = { deletedAt: null };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const elections = await Election.find(filter)
      .populate({ path: 'candidates', match: { deletedAt: null } })
      .sort({ createdAt: -1 });

    // Mask vote counts for everyone if election is not closed
    const formatted = elections.map(e => {
      const doc = e.toObject();
      if (doc.status !== 'closed') {
        doc.totalVotes = 0;
        if (Array.isArray(doc.candidates)) {
          doc.candidates = doc.candidates.map((c: any) => ({ ...c, voteCount: 0 }));
        }
      }
      return doc;
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - Create a new election (election_admin or admin)
export async function POST(request: Request) {
  const { error, user } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();
    const { title, description, startTime, endTime, rules } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: 'Judul, waktu mulai, dan waktu selesai harus diisi.' },
        { status: 400 }
      );
    }

    const election = await Election.create({
      title,
      description: description || '',
      createdBy: user!.name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'draft',
      candidates: [],
      rules: rules || { logic: 'AND', conditions: [], groups: [] },
      totalVotes: 0,
    });

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'PEMILIHAN_BARU',
      description: `Membuat pemilihan baru: "${election.title}"`,
      resource: 'PEMILIHAN',
    });

    return NextResponse.json({ success: true, data: election }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
