import type { Companion } from '@/types';

export const SYSTEM_USER_ID = 'system';

export const DEFAULT_COMPANION: Omit<Companion, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'AI Assistant',
  userId: SYSTEM_USER_ID,
  description: 'A helpful AI assistant that can help you with various tasks.',
  instructions:
    'You are a helpful AI assistant. You help users with their questions and tasks in a friendly and professional manner.',
  seed: "Hello! I'm your AI assistant. How can I help you today?",
  imageUrl: 'https://ui-avatars.com/api/?name=AI+Assistant',
  personality: 'friendly',
  behavior: 'balanced',
  responseStyle: 'conversational',
};
