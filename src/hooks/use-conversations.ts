import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

import {
  createConversation,
  deleteConversation,
  getConversations,
  updateConversation,
} from '@/app/actions/conversations';
import { Conversation } from '@/types';

export const useConversations = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);

      if (data.length > 0) {
        // If conversations exist, select the latest conversation
        const latestConversation = data[0]; // Assuming getConversations returns sorted by lastMessageAt in descending order
        router.push(`/chat?conversation=${latestConversation.id}`);
      } else {
        // If no conversations exist, create one
        const conversation = await createConversation({
          name: 'New Conversation',
        });
        setConversations([conversation]);
        router.push(`/chat?conversation=${conversation.id}`);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleCreate = useCallback(async () => {
    try {
      const conversation = await createConversation({
        name: 'New Conversation',
      });
      setConversations((prev) => [...prev, conversation]);
      router.push(`/chat?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  }, [router]);

  const handleEdit = useCallback(
    async (conversation: Conversation) => {
      if (editingId === conversation.id) {
        try {
          const updated = await updateConversation({
            id: conversation.id,
            name: editingName,
          });
          setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          setEditingId(null);
          setEditingName('');
        } catch (error) {
          console.error('Failed to update conversation:', error);
        }
      } else {
        setEditingId(conversation.id);
        setEditingName(conversation.name);
      }
    },
    [editingId, editingName]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteConversation({ id });
        setConversations((prev) => {
          const updated = prev.filter((c) => c.id !== id);
          if (updated.length === 0) {
            // Create a new conversation immediately if this was the last one
            handleCreate();
          }
          return updated;
        });

        // Find next conversation to navigate to
        const nextConversation = conversations.find((c) => c.id !== id);
        if (nextConversation) {
          router.push(`/chat?conversation=${nextConversation.id}`);
        }
        // If no next conversation, handleCreate will handle the navigation
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    },
    [router, handleCreate, conversations]
  );

  const handleSelect = useCallback(
    (id: string) => {
      router.push(`/chat?conversation=${id}`);
    },
    [router]
  );

  return {
    conversations,
    isLoading,
    editingId,
    editingName,
    setEditingName,
    loadConversations,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSelect,
  };
};
