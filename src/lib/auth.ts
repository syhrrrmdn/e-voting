import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

type AllowedRole = 'admin' | 'election_admin' | 'voter';

/**
 * Verifies session and optionally checks for required roles.
 * Returns the authenticated user document from MongoDB or an error response.
 */
export async function getAuthUser(requiredRoles?: AllowedRole[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Tidak terautentikasi. Silakan login.' },
        { status: 401 }
      ),
      user: null,
    };
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

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
