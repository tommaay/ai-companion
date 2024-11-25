import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { conversations, messages } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { message: content, conversationId } = await req.json();

    let currentConversationId = conversationId;

    // Create a new conversation if none exists
    if (!currentConversationId) {
      const [newConversation] = await db
        .insert(conversations)
        .values({
          userId,
        })
        .returning();

      currentConversationId = newConversation.id;
    }

    // Save user message
    await db.insert(messages).values({
      conversationId: currentConversationId,
      content,
      role: 'user',
    });

    // TODO: Integrate with AI service
    const aiResponse = 'This is a mock response. AI integration coming soon!';

    // Save AI response
    const [savedMessage] = await db
      .insert(messages)
      .values({
        conversationId: currentConversationId,
        content: aiResponse,
        role: 'assistant',
      })
      .returning();

    return NextResponse.json(savedMessage);
  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
