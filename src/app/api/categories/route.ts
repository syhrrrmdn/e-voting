import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import UserCategory from '@/models/UserCategory';

// GET - Retrieve all user categories
export async function GET() {
  try {
    await dbConnect();
    const categories = await UserCategory.find({}).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - Create a new user category (admin only)
export async function POST(request: Request) {
  const { error } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();
    const { key, label, description } = body;

    if (!key || !label) {
      return NextResponse.json(
        { success: false, message: 'Key dan label kategori harus diisi.' },
        { status: 400 }
      );
    }

    const existing = await UserCategory.findOne({ key: key.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Kategori dengan key "${key}" sudah ada.` },
        { status: 409 }
      );
    }

    const category = await UserCategory.create({
      key: key.toLowerCase().replace(/\s+/g, '_'),
      label,
      description: description || '',
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
