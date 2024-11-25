'use server';

import { type User } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';

export async function getOrCreateUser(clerkUser: User) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUser.id))
    .then(res => res[0]);

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        imageUrl: clerkUser.imageUrl,
      })
      .returning();

    return newUser;
  }

  return user;
}
