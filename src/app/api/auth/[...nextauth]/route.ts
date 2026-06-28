import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'user@mudavote.ac.id' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email wajib diisi');
        }
        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
        if (!user) {
          throw new Error('Pengguna tidak ditemukan. Silakan gunakan email yang sudah di-seed atau daftar.');
        }
        if (user.status === 'inactive') {
          throw new Error('Akun Anda dinonaktifkan.');
        }

        // Validate password if user has passwordHash set
        if (user.passwordHash) {
          if (!credentials.password) {
            throw new Error('Kata sandi wajib diisi');
          }
          const hash = crypto.createHash('sha256').update(credentials.password).digest('hex');
          if (user.passwordHash !== hash) {
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
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Auto-create new user as voter on first Google login
            await User.create({
              name: user.name || 'User Baru',
              email: user.email || '',
              avatar: user.image || '',
              role: 'voter',
              attributes: {},
              status: 'active',
            });
          } else {
            // Update avatar if changed
            if (user.image && existingUser.avatar !== user.image) {
              existingUser.avatar = user.image;
              await existingUser.save();
            }
          }
          return true;
        } catch (error) {
          console.error('SignIn callback error:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        // First sign in - fetch from DB
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
