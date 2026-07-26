import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { validateBody, profileUpdateSchema } from '@/lib/validations';

export async function GET() {
  const { error, user } = await getAuthUser();
  if (error) return error;

  return NextResponse.json({
    success: true,
    data: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      category: user.category,
      attributes: user.attributes || {},
      avatar: user.avatar || '',
      status: user.status,
    },
  });
}

export async function PUT(request: Request) {
  const { error, user } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const validation = validateBody(profileUpdateSchema, body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
  }

  const updates: any = {};
  if (validation.data.name) updates.name = validation.data.name;
  if (validation.data.avatar !== undefined) updates.avatar = validation.data.avatar;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, message: 'Tidak ada data untuk diperbarui.' }, { status: 400 });
  }

  Object.assign(user, updates);
  await user.save();

  return NextResponse.json({
    success: true,
    data: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      category: user.category,
      attributes: user.attributes || {},
      avatar: user.avatar || '',
      status: user.status,
    },
  });
}
