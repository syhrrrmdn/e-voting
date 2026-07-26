import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Fetch elections that are active, upcoming, or closed (not draft, not deleted)
    const elections = await Election.find({
      status: { $in: ['active', 'upcoming', 'closed'] },
      deletedAt: null,
    }).sort({ createdAt: -1 });

    // Calculate overall stats from real data
    const totalVotersCount = await User.countDocuments({ role: 'voter', status: 'active', deletedAt: null });
    const activeElectionsCount = elections.filter((e: any) => e.status === 'active').length;
    
    // Sum total votes cast across all elections
    let totalVotesCastCount = 0;
    elections.forEach((e: any) => {
      totalVotesCastCount += e.totalVotes || 0;
    });

    const turnoutRate = totalVotersCount > 0 
      ? Math.min(Math.round((totalVotesCastCount / totalVotersCount) * 100), 100) 
      : 0;

    // Fetch candidates via Candidate.electionId (single source of truth)
    const formattedElections = await Promise.all(
      elections.map(async (e: any) => {
        const doc = e.toObject();
        const candidates = await Candidate.find({ electionId: doc._id || doc.id, deletedAt: null });
        
        let formattedCandidates = candidates.map((c: any) => {
          const cDoc = c.toObject ? c.toObject() : c;
          // If active or upcoming, mask individual vote counts for secrecy
          if (doc.status !== 'closed') {
            cDoc.voteCount = 0;
          }
          return cDoc;
        });

        return {
          _id: doc._id || doc.id,
          title: doc.title,
          description: doc.description,
          startTime: doc.startTime,
          endTime: doc.endTime,
          status: doc.status,
          totalVotes: doc.totalVotes || 0,
          candidates: formattedCandidates,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeElectionsCount,
          totalVotersCount,
          totalVotesCastCount,
          turnoutRate,
        },
        elections: formattedElections,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
