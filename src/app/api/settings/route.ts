import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/auth';
import SystemSettings from '@/models/SystemSettings';
import { settingsSchema, validateBody } from '@/lib/validations';

// GET - Retrieve system settings (singleton)
export async function GET() {
  try {
    await dbConnect();
    let settings = await SystemSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await SystemSettings.create({
        appName: 'MudaVote',
        tagline: 'Platform E-Voting Organisasi Modern',
        defaultLanguage: 'id',
        timezone: 'Asia/Jakarta',
        emailNotification: true,
        autoClose: true,
        maintenanceMode: false,
        maxCandidates: 10,
        minVoterThreshold: 50,
        primaryColor: '#4f46e5',
        logoUrl: '',
        faviconUrl: '',
      });
    }

    const doc = settings.toObject ? settings.toObject() : { ...settings };

    // Clean up legacy JSON from faviconUrl if still present
    if (doc.faviconUrl && typeof doc.faviconUrl === 'string' && doc.faviconUrl.startsWith('{')) {
      try {
        const parsed = JSON.parse(doc.faviconUrl);
        doc.faviconUrl = parsed.url || '';
      } catch (e) {
        doc.faviconUrl = '';
      }
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT - Update system settings (admin only)
export async function PUT(request: Request) {
  const { error } = await getAuthUser(['admin']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(settingsSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    let settings = await SystemSettings.findOne();

    // faviconUrl should only store a URL string, never JSON
    const updatePayload: any = { ...validation.data };

    if (!settings) {
      settings = await SystemSettings.create(updatePayload);
    } else {
      Object.assign(settings, updatePayload);
      await settings.save();
    }

    const doc = settings.toObject ? settings.toObject() : { ...settings };

    // Clean up legacy JSON from faviconUrl if still present
    if (doc.faviconUrl && typeof doc.faviconUrl === 'string' && doc.faviconUrl.startsWith('{')) {
      try {
        const parsed = JSON.parse(doc.faviconUrl);
        doc.faviconUrl = parsed.url || '';
      } catch (e) {
        doc.faviconUrl = '';
      }
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
