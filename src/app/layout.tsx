import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';

import { getOrCreateUser } from '@/app/api/user/actions';
import { getAuthUser } from '@/app/api/auth/utils';
import { Navbar } from '@/components/navbar';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'AI Companion',
  description: 'Your personal AI companion',
};

async function ensureUser() {
  const user = await getAuthUser();
  if (user) {
    await getOrCreateUser(user);
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
