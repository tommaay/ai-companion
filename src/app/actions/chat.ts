'use server';

import { auth } from '@clerk/nextjs/server';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { conversations, messages } from '@/db/schema';
import { replicate } from '@/lib/replicate';
import type { Message, GetMessagesParams, SaveUserMessageParams } from '@/types/message';

export async function getMessages({ conversationId }: GetMessagesParams): Promise<Message[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return chatMessages;
}

interface SaveMessageParams extends SaveUserMessageParams {
  companionId: string;
}

export async function sendMessage({
  content,
  companionId,
  conversationId,
}: SaveMessageParams): Promise<{ userMessage: Message; aiMessage: Message }> {
  const [userMessage, aiMessage] = await Promise.all([
    saveUserMessage({
      content,
      companionId,
      conversationId,
      role: 'user',
    }),
    generateAndSaveAIResponse({
      userMessage: content,
      conversationId,
    }),
  ]);

  return { userMessage, aiMessage };
}

export async function saveUserMessage({
  content,
  companionId,
  conversationId,
}: SaveMessageParams): Promise<Message> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  let actualConversationId = conversationId;

  if (!actualConversationId) {
    const [conversation] = await db
      .insert(conversations)
      .values({
        name: content.slice(0, 100),
        userId,
        companionId,
      })
      .returning();

    actualConversationId = conversation.id;
  }

  const [message] = await db
    .insert(messages)
    .values({
      content,
      role: 'user',
      conversationId: actualConversationId,
    })
    .returning();

  revalidatePath('/');
  return message;
}

interface GenerateAIResponseParams {
  userMessage: string;
  conversationId: string;
}

export async function generateAndSaveAIResponse({
  userMessage,
  conversationId,
}: GenerateAIResponseParams): Promise<Message> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const conversation = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation[0]) throw new Error('Conversation not found');

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
    const [message] = await db
      .insert(messages)
      .values({
        content,
        role: 'assistant',
        conversationId,
      })
      .returning();

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    revalidatePath('/');
    return message;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}
