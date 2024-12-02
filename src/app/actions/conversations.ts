'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { SYSTEM_USER_ID } from '@/db/constants';
import { conversations, userPreferences, companions } from '@/db/schema';
import type {
  Conversation,
  CreateConversationParams,
  UpdateConversationParams,
  DeleteConversationParams,
} from '@/types/conversation';

import { getOrCreateUser } from './users';

const getDefaultCompanionId = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  // First try to get the user's default companion from preferences
  const [userPref] = await db
    .select({ defaultCompanionId: userPreferences.defaultCompanionId })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));

  if (userPref?.defaultCompanionId) {
    return userPref.defaultCompanionId;
  }

  // If no default set, get the system's default companion
  const [defaultCompanion] = await db
    .select({ id: companions.id })
    .from(companions)
    .where(eq(companions.userId, SYSTEM_USER_ID))
    .limit(1);

  return defaultCompanion?.id ?? null;
};

export async function getConversations(): Promise<Conversation[]> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized: No user ID found');

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.lastMessageAt));

    return userConversations;
  } catch (error) {
    console.error('Server-side error in getConversations:', error);
    
    // Re-throw the error to be caught by the client
    if (error instanceof Error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
    
    throw new Error('An unknown error occurred while fetching conversations');
  }
}

export async function createConversation({
  name,
  companionId,
}: CreateConversationParams): Promise<Conversation> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Ensure user exists in our database
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error('User not found');
    }
    await getOrCreateUser(clerkUser);

    // If no companionId provided, try to get the default from user preferences
    let finalCompanionId = companionId;
    if (!companionId) {
      try {
        const defaultId = await getDefaultCompanionId();
        if (defaultId) {
          finalCompanionId = defaultId;
        }
      } catch (error) {
        console.warn('Failed to get default companion:', error);
      }
    }

    const [conversation] = await db
      .insert(conversations)
      .values({
        name,
        userId,
        ...(finalCompanionId && { companionId: finalCompanionId }),
      })
      .returning();

    revalidatePath('/');
    return conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function updateConversation({
  id,
  name,
}: UpdateConversationParams): Promise<Conversation> {
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

export async function deleteConversation({ id }: DeleteConversationParams): Promise<Conversation> {
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
