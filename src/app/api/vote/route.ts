import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { checkEligibility } from '@/lib/ruleEngine';
import Election from '@/models/Election';
import User from '@/models/User';
import { voteSchema, validateBody } from '@/lib/validations';

// POST - Cast a vote (atomic via RPC)
export async function POST(request: Request) {
  // 1. Authenticate — userId comes from server session, NEVER from client
  const { error, user } = await getAuthUser(['voter']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();

    // 2. Validate input with Zod
    const validation = validateBody(voteSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const { electionId, candidateId } = validation.data;
    const userId = user!._id.toString(); // From server session, NOT from client

    // 3. Check voter eligibility via rule engine (application-level)
    const election = await Election.findOne({ _id: electionId, deletedAt: null });
    if (!election) {
      return NextResponse.json(
        { success: false, message: 'Pemilihan tidak ditemukan.' },
        { status: 404 }
      );
    }

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

    // 4. Call atomic vote RPC function (handles insert + increment in one transaction)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('cast_vote', {
      p_user_id: userId,
      p_election_id: electionId,
      p_candidate_id: candidateId,
    });

    if (rpcError) {
      // Handle PostgreSQL unique violation (duplicate vote)
      if (rpcError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'Anda sudah memberikan suara pada pemilihan ini.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: rpcError.message || 'Terjadi kesalahan saat memproses suara.' },
        { status: 500 }
      );
    }

    // RPC returns JSON with success/message
    if (rpcResult && !rpcResult.success) {
      const statusCode = rpcResult.message?.includes('sudah memberikan') ? 409 : 400;
      return NextResponse.json(
        { success: false, message: rpcResult.message },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: rpcResult?.message || 'Suara Anda berhasil dicatat. Terima kasih telah berpartisipasi!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// GET - Get list of elections the voter has participated in
export async function GET() {
  const { error, user } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { default: VoteRecord } = await import('@/models/VoteRecord');
    const votes = await VoteRecord.find({ userId: user!._id.toString() });
    return NextResponse.json({ success: true, data: votes });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
