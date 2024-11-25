'use server';

import { auth } from '@clerk/nextjs/server';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { conversations, messages } from '@/db/schema';

export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
};

export async function getMessages(conversationId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return chatMessages;
}

export async function sendMessage(content: string, conversationId?: string | null) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  let currentConversationId = conversationId;

  // Create a new conversation if none exists
  if (!currentConversationId) {
    const [newConversation] = await db
      .insert(conversations)
      .values({
        userId,
        name: content.slice(0, 100), // Use first 100 chars of message as conversation name
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

  // TODO: Replace with actual AI response
  const aiResponse =
    "Hello! I'm your AI companion. I'm here to help you with any questions or tasks you might have.";

  // Save AI response
  const [savedMessage] = await db
    .insert(messages)
    .values({
      conversationId: currentConversationId,
      content: aiResponse,
      role: 'assistant',
    })
    .returning();

  revalidatePath('/');
  return { message: savedMessage, conversationId: currentConversationId };
}
