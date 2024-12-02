import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import { users } from '@/db/schema';

import type { Conversation } from './conversation';

export type User = InferSelectModel<typeof users>;
export type UserCreate = InferInsertModel<typeof users>;
export type UserUpdate = Partial<UserCreate>;

export type UserWithConversations = User & {
  conversations: Conversation[];
};
