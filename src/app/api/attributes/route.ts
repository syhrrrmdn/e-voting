import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import DynamicAttribute from '@/models/DynamicAttribute';
import AuditLog from '@/models/AuditLog';

// GET - Retrieve all dynamic attributes
export async function GET() {
  try {
    await dbConnect();
    const attributes = await DynamicAttribute.find({ deletedAt: null }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: attributes });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - Create a new dynamic attribute (admin only)
export async function POST(request: Request) {
  const { error, user } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();
    const { key, label, type, options, required, applicableTo } = body;

    if (!key || !label || !type) {
      return NextResponse.json(
        { success: false, message: 'Key, label, dan type harus diisi.' },
        { status: 400 }
      );
    }

    const existing = await DynamicAttribute.findOne({ key: key.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Atribut dengan key "${key}" sudah ada.` },
        { status: 409 }
      );
    }

    const attribute = await DynamicAttribute.create({
      key: key.toLowerCase(),
      label,
      type,
      options: options || [],
      required: required || false,
      applicableTo: applicableTo || [],
    });

    await AuditLog.create({
      userId: user!._id.toString(),
      userName: user!.name,
      action: 'TAMBAH_ATRIBUT',
      description: `Menambahkan atribut dinamis: "${attribute.label}" (${attribute.type})`,
      resource: 'ATRIBUT',
    });

    return NextResponse.json({ success: true, data: attribute }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
