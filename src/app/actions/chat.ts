'use server';

import { auth } from '@clerk/nextjs/server';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { replicate } from '@/lib/replicate';

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

export async function saveUserMessage(content: string, conversationId?: string | null) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  let currentConversationId = conversationId;

  // Create a new conversation if none exists
  if (!currentConversationId) {
    const [newConversation] = await db
      .insert(conversations)
      .values({
        userId,
        name: content.slice(0, 100),
      })
      .returning();

    currentConversationId = newConversation.id;
  }

  // Save user message
  const [savedMessage] = await db
    .insert(messages)
    .values({
      conversationId: currentConversationId,
      content,
      role: 'user',
    })
    .returning();

  revalidatePath('/');
  return { message: savedMessage, conversationId: currentConversationId };
}

export async function generateAndSaveAIResponse(userMessage: string, conversationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    const output = (await replicate.run(
      'meta/codellama-7b-instruct:aac3ab196f8a75729aab9368cd45ea6ad3fc793b6cda93b1ded17299df369332',
      {
        input: {
          prompt: userMessage,
          system_prompt: `You're a friendly and empathetic AI companion.
            Keep responses very short and casual - just 2-3 sentences max.
            Be warm and genuine, like texting with a close friend.
            Focus on relating and empathizing rather than giving advice.`,
        },
      }
    )) as string[];

    if (!output) throw new Error('No output from Replicate');

    const content = output.join('');
    const message = {
      id: crypto.randomUUID().toString(),
      content,
      conversationId,
      role: 'assistant' as const,
      createdAt: new Date(),
    };

    await db.insert(messages).values({
      ...message,
    });

    return message;
  } catch (error) {
    console.error('Error generating AI response:', error);
  }
}

export async function sendMessage(content: string, conversationId?: string | null) {
  const result = await saveUserMessage(content, conversationId);
  // Return immediately after saving user message
  return {
    message: result.message,
    conversationId: result.conversationId,
  };
}
