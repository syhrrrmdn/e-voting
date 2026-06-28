import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DynamicAttribute from '@/models/DynamicAttribute';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, category, attributes } = body;

    // 1. Basic validation
    if (!name || !email || !password || !category) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, password, dan kategori wajib diisi.' },
        { status: 400 }
      );
    }

    // 2. Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    // 3. Password length check
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal 6 karakter.' },
        { status: 400 }
      );
    }

    // 4. Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar.' },
        { status: 409 }
      );
    }

    // 5. Fetch active attributes to validate required fields
    const dynamicAttrs = await DynamicAttribute.find({});
    
    // Filter attributes that are applicable to this category and required
    const requiredAttrs = dynamicAttrs.filter(attr => {
      const isApplicable = !attr.applicableTo || attr.applicableTo.length === 0 || attr.applicableTo.includes(category);
      return isApplicable && attr.required;
    });

    // Validate if any required attribute is missing
    const userAttrs = attributes || {};
    for (const attr of requiredAttrs) {
      const val = userAttrs[attr.key];
      if (val === undefined || val === null || String(val).trim() === '') {
        return NextResponse.json(
          { success: false, message: `Atribut "${attr.label}" wajib diisi.` },
          { status: 400 }
        );
      }
    }

    // 6. Hash password with SHA-256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // 7. Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'voter',
      category,
      attributes: userAttrs,
      status: 'active',
      avatar: '',
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan masuk ke akun Anda.',
      data: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        category: newUser.category,
      }
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
