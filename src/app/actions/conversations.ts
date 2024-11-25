'use server';

import { auth } from '@clerk/nextjs/server';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { conversations } from '@/db/schema';

export async function getConversations() {
  const { userId } = await auth();
  if (!userId) return [];

  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.lastMessageAt));
}

export async function createConversation() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [conversation] = await db
    .insert(conversations)
    .values({
      userId,
      name: 'New Conversation',
    })
    .returning();

  revalidatePath('/');
  return conversation;
}

export async function updateConversation(id: string, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [conversation] = await db
    .update(conversations)
    .set({ name })
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .returning();

  if (!conversation) throw new Error('Not found');

  revalidatePath('/');
  return conversation;
}

export async function deleteConversation(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [conversation] = await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .returning();

  if (!conversation) throw new Error('Not found');

  revalidatePath('/');
  return conversation;
}
