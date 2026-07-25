import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { error } = await supabase.from('SystemSettings').select('appName').limit(1);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      status: 'Connected',
      readyState: 1,
      message: 'Koneksi ke Supabase/PostgreSQL berhasil terhubung!',
      dbName: 'Supabase PostgreSQL'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Gagal terhubung ke Supabase/PostgreSQL',
      error: error.message || error
    }, { status: 500 });
  }
}
