import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';

// PUT - Update candidate
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const candidate = await Candidate.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Kandidat tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: candidate });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Remove candidate
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Kandidat tidak ditemukan.' }, { status: 404 });
    }

    // Remove candidate ref from election
    await Election.findByIdAndUpdate(candidate.electionId, {
      $pull: { candidates: candidate._id },
    });

    await Candidate.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Kandidat berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
