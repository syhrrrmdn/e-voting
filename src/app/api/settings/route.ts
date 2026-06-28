import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import SystemSettings from '@/models/SystemSettings';

// GET - Retrieve system settings (singleton)
export async function GET() {
  const { error } = await getAuthUser(['admin', 'election_admin', 'voter']);
  if (error) return error;

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
      });
    }

    return NextResponse.json({ success: true, data: settings });
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

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
