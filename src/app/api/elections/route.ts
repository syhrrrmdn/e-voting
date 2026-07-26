import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import AuditLog from '@/models/AuditLog';
import { canAccessElection } from '@/lib/accessControl';
import { electionSchema, validateBody } from '@/lib/validations';

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

    const elections = await Election.find(filter).sort({ createdAt: -1 });

    // Fetch candidates for each election via Candidate.electionId (single source of truth)
    const electionDocs = await Promise.all(
      elections.map(async (e: any) => {
        const doc = e.toObject ? e.toObject() : e;
        const candidates = await Candidate.find({ electionId: doc._id || doc.id, deletedAt: null });
        doc.candidates = candidates.map((c: any) => c.toObject ? c.toObject() : c);
        return doc;
      })
    );

    // Filter elections for election_admin based on category AND attributes
    let accessibleElections = electionDocs;
    if (user!.role === 'election_admin') {
      accessibleElections = electionDocs.filter((elDoc: any) => {
        return canAccessElection(user, elDoc);
      });
    }

    // Mask vote counts for everyone if election is not closed
    const formatted = accessibleElections.map((doc: any) => {
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

    // Zod validation
    const validation = validateBody(electionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const { title, description, startTime, endTime, rules } = validation.data;

    // Clean rules — only voter eligibility, no creator metadata
    const rulesObj = rules || { logic: 'AND', conditions: [], groups: [] };

    const election = await Election.create({
      title,
      description: description || '',
      createdBy: user!.name,
      createdById: user!._id.toString(),
      creatorCategory: user!.category || '',
      creatorAttributes: user!.attributes || {},
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'draft',
      candidates: [], // Legacy column — not used, kept for compatibility
      rules: rulesObj,
      totalVotes: 0,
    });

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'PEMILIHAN_BARU',
      description: `Membuat pemilihan baru: "${election.title}"`,
      resource: 'PEMILIHAN',
    });

    const doc = election.toObject();
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
