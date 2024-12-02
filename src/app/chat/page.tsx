import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { ChatArea } from '@/components/chat-area';
import { Sidebar } from '@/components/sidebar';

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
