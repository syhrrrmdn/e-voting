import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

type AllowedRole = 'admin' | 'election_admin' | 'voter';

/**
 * Verifies Supabase Auth session and optionally checks for required roles.
 * Returns the authenticated user document from DB or an error response.
 */
export async function getAuthUser(requiredRoles?: AllowedRole[]) {
  // 1. Read Supabase Auth session from cookies
  const supabase = await createSupabaseServerClient();
  const { data: { user: sbUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !sbUser?.email) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Tidak terautentikasi. Silakan login.' },
        { status: 401 }
      ),
      user: null,
    };
  }

  // 2. Fetch user from application database by email
  await dbConnect();
  const user = await User.findOne({ email: sbUser.email });

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Akun pengguna tidak ditemukan di database.' },
        { status: 404 }
      ),
      user: null,
    };
  }

  if (user.status === 'inactive') {
    return {
      error: NextResponse.json(
        { success: false, message: 'Akun Anda telah dinonaktifkan.' },
        { status: 403 }
      ),
      user: null,
    };
  }

  // 3. Check role authorization
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role as AllowedRole)) {
      return {
        error: NextResponse.json(
          { success: false, message: 'Anda tidak memiliki izin untuk mengakses resource ini.' },
          { status: 403 }
        ),
        user: null,
      };
    }
  }

  return { error: null, user };
}
