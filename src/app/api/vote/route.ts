import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import VoteRecord from '@/models/VoteRecord';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import AuditLog from '@/models/AuditLog';
import User from '@/models/User';
import { checkEligibility } from '@/lib/ruleEngine';

// POST - Cast a vote
export async function POST(request: Request) {
  const { error, user } = await getAuthUser(['voter']);
  if (error) return error;

  try {
    await dbConnect();
    const { electionId, candidateId } = await request.json();

    if (!electionId || !candidateId) {
      return NextResponse.json(
        { success: false, message: 'ID pemilihan dan ID kandidat harus diisi.' },
        { status: 400 }
      );
    }

    // 1. Validate election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }
    if (election.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Pemilihan ini tidak sedang berlangsung.' },
        { status: 400 }
      );
    }

    // 2. Validate time window
    const now = new Date();
    if (now < new Date(election.startTime) || now > new Date(election.endTime)) {
      return NextResponse.json(
        { success: false, message: 'Pemilihan belum dimulai atau sudah berakhir.' },
        { status: 400 }
      );
    }

    // 3. Validate candidate belongs to this election
    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.electionId.toString() !== electionId) {
      return NextResponse.json(
        { success: false, message: 'Kandidat tidak valid untuk pemilihan ini.' },
        { status: 400 }
      );
    }

    // 4. Check voter eligibility via rule engine
    if (election.rules) {
      const eligible = checkEligibility(
        { category: user!.category, ...(user!.attributes || {}) },
        election.rules
      );
      if (!eligible) {
        return NextResponse.json(
          { success: false, message: 'Anda tidak memenuhi kriteria untuk memberikan suara pada pemilihan ini.' },
          { status: 403 }
        );
      }
    }

    // 5. Check for double vote (enforced by compound unique index too)
    const existingVote = await VoteRecord.findOne({
      userId: user!._id.toString(),
      electionId,
    });
    if (existingVote) {
      return NextResponse.json(
        { success: false, message: 'Anda sudah memberikan suara pada pemilihan ini.' },
        { status: 409 }
      );
    }

    // 6. Record the vote (anonymous - no candidateId stored to protect vote secrecy)
    await VoteRecord.create({
      userId: user!._id.toString(),
      electionId,
    });

    // 7. Increment candidate vote count and election total
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });

    // 8. Log audit
    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'VOTE',
      description: `Memberikan suara pada pemilihan: ${election.title}`,
      resource: 'VOTE',
    });

    return NextResponse.json({
      success: true,
      message: 'Suara Anda berhasil dicatat. Terima kasih telah berpartisipasi!',
    });
  } catch (err: any) {
    // Handle duplicate key error from compound index
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Anda sudah memberikan suara pada pemilihan ini.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// GET - Get list of elections the voter has participated in
export async function GET() {
  const { error, user } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const votes = await VoteRecord.find({ userId: user!._id.toString() });
    return NextResponse.json({ success: true, data: votes });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

