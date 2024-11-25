import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull().default('New Conversation'),
  lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
