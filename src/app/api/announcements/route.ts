import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import Announcement from '@/models/Announcement';
import { announcementSchema, validateBody } from '@/lib/validations';

// GET - Retrieve all active announcements (Public)
export async function GET() {
  try {
    await dbConnect();
    let announcements = await Announcement.find({ deletedAt: null })
      .sort({ createdAt: -1 });

    // Convert to plain objects
    let active = announcements.map((a: any) => a.toObject ? a.toObject() : a);

    // Seed default welcome announcement if empty
    if (active.length === 0) {
      const defaultAnn = await Announcement.create({
        title: 'Selamat Datang di Portal Pemilihan Resmi MudaVote',
        content: 'Selamat datang di platform E-Voting resmi MudaVote. Seluruh pengumuman resmi, petunjuk teknis pemilihan, edaran panitia, serta pengumuman hasil pemungutan suara dapat Anda pantau secara langsung melalui portal publik ini tanpa perlu melakukan login.',
        category: 'INFORMASI',
        imageUrl: '',
        isPinned: true,
        authorName: 'Panitia Pemilihan',
      });
      active = [defaultAnn.toObject ? defaultAnn.toObject() : defaultAnn];
    }

    // Sort by isPinned descending, then createdAt descending
    const sorted = [...active].sort((a: any, b: any) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return NextResponse.json({ success: true, data: sorted });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}

// POST - Create a new announcement (Admin & Election Admin)
export async function POST(request: Request) {
  const { error, user } = await getAuthUser(['admin', 'election_admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(announcementSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const { title, content, category, imageUrl, isPinned } = validation.data;

    const newAnnouncement = await Announcement.create({
      title,
      content,
      category,
      imageUrl: imageUrl || '',
      isPinned: Boolean(isPinned),
      authorName: user.name || 'Admin',
      createdById: user._id || user.id || null,
    });

    return NextResponse.json({ success: true, data: newAnnouncement });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
