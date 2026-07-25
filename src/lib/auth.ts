import { getServerSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { supabase } from '@/lib/supabase';
import User from '@/models/User';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'user@mudavote.ac.id' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }

        const cleanEmail = credentials.email.toLowerCase().trim();
        await dbConnect();

        // 1. Fetch user from application database
        const user = await User.findOne({ email: cleanEmail, deletedAt: null });
        if (!user) {
          throw new Error('Pengguna tidak ditemukan. Silakan mendaftar terlebih dahulu.');
        }

        if (user.status === 'inactive') {
          throw new Error('Akun Anda dinonaktifkan.');
        }

        // 2. Authenticate via Supabase Auth
        let supabaseAuthSuccess = false;
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: credentials.password,
          });

          if (!authError && authData?.user) {
            supabaseAuthSuccess = true;
          }
        } catch (sbErr) {
          console.warn('Supabase Auth direct sign-in check note:', sbErr);
        }

        // 3. Fallback/Sync with database password hash if Supabase Auth user not registered yet
        if (!supabaseAuthSuccess) {
          if (user.passwordHash) {
            const hash = crypto.createHash('sha256').update(credentials.password).digest('hex');
            if (user.passwordHash !== hash) {
              throw new Error('Kata sandi salah.');
            }
            // Auto-register legacy user into Supabase Auth for full sync
            try {
              await supabase.auth.signUp({
                email: cleanEmail,
                password: credentials.password,
                options: {
                  data: { name: user.name, role: user.role, category: user.category },
                },
              });
            } catch (syncErr) {
              // Ignore if already existing
            }
          } else {
            throw new Error('Kata sandi salah.');
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
          status: user.status,
          attributes: user.attributes,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }) {
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        // First sign in - fetch from DB
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email, deletedAt: null });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.attributes = dbUser.attributes;
        }
      }

      // Handle session update trigger (e.g. role change)
      if (trigger === 'update' && session) {
        token.role = session.role || token.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).attributes = token.attributes;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

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
