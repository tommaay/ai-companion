export interface User {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  name: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

// Extended types with relationships
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface UserWithConversations extends User {
  conversations: Conversation[];
}
