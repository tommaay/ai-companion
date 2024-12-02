import { index, pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const personalityEnum = pgEnum('personality_type', [
  'casual', // Casual and friendly
  'professional', // Formal and business-like
  'friendly', // Warm and approachable
  'humorous', // Light-hearted and witty
  'academic', // Scholarly and analytical
  'creative', // Imaginative and artistic
  'motivational', // Encouraging and inspiring
  'philosophical', // Thoughtful and contemplative
  'pragmatic', // Practical and results-oriented
  'empathetic', // Understanding and compassionate
  'adventurous', // Bold and exciting
]);

export const behaviorEnum = pgEnum('behavior_type', [
  'proactive', // Takes initiative in conversations
  'reactive', // Responds to user prompts
  'balanced', // Mix of proactive and reactive
  'analytical', // Focuses on breaking down problems
  'collaborative', // Works together with the user
  'mentoring', // Guides and teaches
  'observant', // Pays attention to details and patterns
]);

export const responseStyleEnum = pgEnum('response_style_type', [
  'concise', // Brief and to-the-point
  'detailed', // Comprehensive and thorough
  'conversational', // Natural dialogue style
  'socratic', // Uses questions to guide thinking
  'visual', // Emphasizes diagrams and examples
  'structured', // Well-organized with clear sections
  'storytelling', // Uses narratives and examples
]);

export const companions = pgTable(
  'companions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    description: text('description').notNull(),
    // The system prompt that defines the AI's behavior, personality, and expertise
    instructions: text('instructions').notNull(),
    // The initial message the AI uses to start conversations
    seed: text('seed').notNull(),
    imageUrl: text('image_url').notNull(),
    personality: personalityEnum('personality').notNull(),
    behavior: behaviorEnum('behavior').notNull(),
    responseStyle: responseStyleEnum('response_style').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('companions_user_id_index').on(table.userId),
    index('companions_name_index').on(table.name),
  ]
);

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    companionId: uuid('companion_id').references(() => companions.id),
    name: text('name').notNull().default('New Conversation'),
    lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('conversations_name_index').on(table.name.asc()),
    index('conversations_user_id_index').on(table.userId.asc()),
    index('conversations_companion_id_index').on(table.companionId.asc()),
    index('conversations_last_message_at_index').on(table.lastMessageAt.desc()),
  ]
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('messages_conversation_id_index').on(table.conversationId.asc()),
    index('messages_created_at_index').on(table.createdAt.desc()),
  ]
);

export const images = pgTable(
  'images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    // Optional: image might be generated without a companion
    companionId: uuid('companion_id').references(() => companions.id),
    // Optional: image might be generated outside a conversation
    conversationId: uuid('conversation_id').references(() => conversations.id, {
      onDelete: 'cascade',
    }),
    prompt: text('prompt').notNull(),
    imageUrl: text('image_url').notNull(),
    // Type can be standalone, avatar, or conversation
    type: text('type', { enum: ['standalone', 'avatar', 'conversation'] }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('images_user_id_index').on(table.userId),
    index('images_companion_id_index').on(table.companionId),
    index('images_conversation_id_index').on(table.conversationId),
    index('images_type_index').on(table.type),
    index('images_created_at_index').on(table.createdAt.desc()),
  ]
);

export const userPreferences = pgTable(
  'user_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id)
      .unique(), // One preference record per user
    // Default companion for quick access
    defaultCompanionId: uuid('default_companion_id').references(() => companions.id),
    // UI Theme preference
    theme: text('theme', { enum: ['light', 'dark', 'system'] })
      .notNull()
      .default('system'),
    // Model preference for responses
    modelPreference: text('model_preference', {
      enum: [
        // Premium Conversation Models
        'meta-llama-3-70b-instruct-turbo', // Best overall quality and natural dialogue ($0.88/1M tokens)
        'mixtral-8x22b-instruct-v0.1', // Excellent for detailed conversations ($1.20/1M tokens)
        'qwen2.5-72b-instruct-turbo', // Fast responses with high coherence ($1.20/1M tokens)
        // Balanced Performance Models
        'meta-llama-3-8b-instruct-turbo', // Good balance of quality and speed ($0.18/1M tokens)
        'qwen2.5-7b-instruct-turbo', // Quick responses, good personality ($0.30/1M tokens)
        'mistral-7b-instruct-v0.3', // Great at maintaining context ($0.20/1M tokens)
        // Specialized Models
        'nous-hermes-2-mixtral-8x7b-dpo', // Trained for helpful, honest dialogue ($0.60/1M tokens)
        'deepseek-llm-67b-chat', // Strong reasoning and explanations ($0.90/1M tokens)
      ],
    })
      .notNull()
      .default('meta-llama-3-8b-instruct-turbo'),
    // Image model preference
    imageModelPreference: text('image_model', {
      enum: [
        'dall-e-3', // Best for realistic images and following complex prompts ($0.040/image)
        'dall-e-2', // Fast and reliable for simpler images ($0.020/image)
        'stable-diffusion-xl', // Great for artistic and creative styles ($0.008/image)
        'flux-1-pro', // Excellent for detailed illustrations and paintings ($0.010/image)
        'flux-1-schnell', // Fastest option, good for quick iterations ($0.004/image)
      ],
    })
      .notNull()
      .default('dall-e-2'),
    // Default values for new companions
    defaultPersonality: personalityEnum('default_personality').notNull().default('casual'),
    defaultBehavior: behaviorEnum('default_behavior').notNull().default('balanced'),
    defaultResponseStyle: responseStyleEnum('default_response_style')
      .notNull()
      .default('conversational'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('user_preferences_user_id_index').on(table.userId)]
);
