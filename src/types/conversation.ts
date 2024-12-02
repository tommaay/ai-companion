import type { InferSelectModel } from 'drizzle-orm';

import { conversations } from '@/db/schema';

import type { Message } from './message';

export type Conversation = InferSelectModel<typeof conversations>;

export type CreateConversationParams = {
  name?: string;
  companionId?: string;
};

export type UpdateConversationParams = {
  id: string;
  name: string;
};

export type DeleteConversationParams = {
  id: string;
};

// Extended type with relationships
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}
