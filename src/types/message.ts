import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import { messages } from '@/db/schema';

export type Message = InferSelectModel<typeof messages>;

export type GetMessagesParams = {
  conversationId: string;
};

export type SaveUserMessageParams = InferInsertModel<typeof messages>;
