import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import UserCategory from '@/models/UserCategory';
import DynamicAttribute from '@/models/DynamicAttribute';

// PUT - Update a category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Don't allow changing the key to prevent orphaning attribute references
    const { label, description } = body;

    const category = await UserCategory.findByIdAndUpdate(
      id,
      { label, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE - Remove a category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;

    const category = await UserCategory.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan.' }, { status: 404 });
    }

    // Remove this category key from all dynamic attributes' applicableTo arrays
    await DynamicAttribute.updateMany(
      { applicableTo: category.key },
      { $pull: { applicableTo: category.key } }
    );

    await UserCategory.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
