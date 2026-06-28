import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - api/seed (seeding route)
     * - api/db-check (database connection check)
     * - login (custom login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/seed|api/db-check|api/register|api/categories|api/attributes|login|register|_next/static|_next/image|favicon.ico).*)',
  ],
};
