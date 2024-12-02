'use client';

import { useAuth } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { sendMessage, getMessages } from '@/app/actions/chat';
import type { Message } from '@/types/message';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();

  // Load messages when conversation changes
  useEffect(() => {
    if (!isSignedIn) return;
    const currentConversationId = searchParams.get('conversation');

    if (currentConversationId) {
      getMessages({ conversationId: currentConversationId }).then(setMessages);
    }
  }, [searchParams, isSignedIn]);

  const sendMessageToAI = useCallback(
    async (content: string) => {
      if (!isSignedIn) {
        setError('Please sign in to send messages');
        return;
      }

      if (!content.trim()) {
        return;
      }

      const userMessage = content.trim();

      // Add user message immediately
      const optimisticId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          conversationId: searchParams.get('conversation') ?? '',
          content: userMessage,
          role: 'user',
          createdAt: new Date(),
        } as Message,
      ]);

      try {
        setIsLoading(true);
        setError(null);

        const { userMessage: savedUserMessage, aiMessage } = await sendMessage({
          content: userMessage,
          companionId: searchParams.get('companion') ?? '',
          conversationId: searchParams.get('conversation'),
        });

        // Replace optimistic message with saved messages
        setMessages((prev) => {
          const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticId);
          return [...withoutOptimistic, savedUserMessage, aiMessage];
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      } finally {
        setIsLoading(false);
      }
    },
    [isSignedIn, searchParams]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessageToAI,
  };
};
