import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    // Check current state of mongoose connection
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const state = mongoose.connection.readyState;
    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
    
    return NextResponse.json({
      success: true,
      status: states[state],
      readyState: state,
      message: 'Koneksi ke MongoDB berhasil terhubung!',
      dbName: mongoose.connection.name
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Gagal terhubung ke MongoDB',
      error: error.message || error
    }, { status: 500 });
  }
}
