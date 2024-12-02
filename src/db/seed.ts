import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { companions } from '@/db/schema';

import { DEFAULT_COMPANION } from './constants';

export async function seedCompanions() {
  try {
    // Check if default companion exists
    const [existingDefaultCompanion] = await db
      .select()
      .from(companions)
      .where(eq(companions.userId, DEFAULT_COMPANION.userId))
      .limit(1);

    if (existingDefaultCompanion) {
      console.log('Default companion already exists, skipping seed');
      return existingDefaultCompanion;
    }

    // Create default companion
    const [companion] = await db.insert(companions).values(DEFAULT_COMPANION).returning();

    console.log('Created default companion:', companion);
    return companion;
  } catch (error) {
    console.error('Error seeding companions:', error);
    throw error;
  }
}
