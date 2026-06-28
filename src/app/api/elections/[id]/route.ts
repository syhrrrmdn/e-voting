import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Election from '@/models/Election';

// GET - Get single election by ID (with populated candidates)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const election = await Election.findById(id).populate('candidates');

    if (!election) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: election });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT - Update election (admin or election_admin)
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

    // Prevent editing closed elections
    const existing = await Election.findById(id);
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
    }).populate('candidates');

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
  const { error } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const election = await Election.findById(id);
    if (!election) {
      return NextResponse.json({ success: false, message: 'Pemilihan tidak ditemukan.' }, { status: 404 });
    }
    if (election.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Hanya pemilihan berstatus draft yang dapat dihapus.' },
        { status: 400 }
      );
    }

    await Election.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Pemilihan berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
