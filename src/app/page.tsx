import { auth } from '@clerk/nextjs/server';
import { ChatBox } from '@/components/chat-box';

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI Companion</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sign in to start chatting with your personal AI companion
        </p>
      </div>
    );
  }

  return <ChatBox />;
}
