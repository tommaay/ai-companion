import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { ModeToggle } from './mode-toggle';

export async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="fixed inset-x-0 top-0 bg-background border-b h-16">
      <div className="px-4 h-full max-w-screen-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">AI Companion</span>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {!userId ? (
            <>
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
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
