'use server';

import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

import { ChatArea } from '@/components/chat-area';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';


export default async function LandingPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-3xl mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI Companion</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your personal AI companion for engaging conversations and helpful assistance
        </p>
        <SignInButton mode="modal">
          <Button size="lg">Get Started</Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
