import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import Election from '@/models/Election';
import VoteRecord from '@/models/VoteRecord';
import AuditLog from '@/models/AuditLog';

// GET - Dashboard statistics
export async function GET() {
  const { error } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();

    const [
      totalUsers,
      activeUsers,
      totalElections,
      activeElections,
      totalVotes,
      recentLogs,
      electionsByStatus,
      usersByRole,
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ status: 'active', deletedAt: null }),
      Election.countDocuments({ deletedAt: null }),
      Election.countDocuments({ status: 'active', deletedAt: null }),
      VoteRecord.countDocuments(),
      AuditLog.find().sort({ timestamp: -1 }).limit(10),
      Election.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalElections,
        activeElections,
        totalVotes,
        recentLogs,
        electionsByStatus: electionsByStatus.reduce(
          (acc: any, cur: any) => ({ ...acc, [cur._id]: cur.count }),
          {}
        ),
        usersByRole: usersByRole.reduce(
          (acc: any, cur: any) => ({ ...acc, [cur._id]: cur.count }),
          {}
        ),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
