import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  // If user is logged in and on public route, redirect to chat
  if (userId && path === '/') {
    const chatUrl = new URL('/chat', req.url);
    return Response.redirect(chatUrl);
  }

  // If user is not logged in and trying to access protected route, redirect to home
  if (!userId && path !== '/') {
    const homeUrl = new URL('/', req.url);
    return Response.redirect(homeUrl);
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!.*\\..*|_next).*)',
    '/',
    '/api/(.*)',
  ],
};
