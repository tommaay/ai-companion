import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="fixed inset-x-0 top-0 bg-white border-b border-gray-200 z-30 h-16">
      <div className="px-4 h-full max-w-screen-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">AI Companion</span>
        </Link>
        <div className="flex items-center gap-4">
          {!userId ? (
            <>
              <Link
                href="/sign-in"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Sign up
              </Link>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </nav>
  );
}
