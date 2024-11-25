import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  name: string;
  userId: string;
  lastMessageAt: Date;
  createdAt: Date;
}

export const useConversations = () => {
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await axios.get('/api/conversations');
      return response.data;
    },
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/conversations');
      return response.data;
    },
    onSuccess: newConversation => {
      queryClient.setQueryData(['conversations'], (oldData: Conversation[] = []) => [
        newConversation,
        ...oldData,
      ]);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        description: 'Failed to create conversation',
      });
    },
  });

  const updateConversation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await axios.patch(`/api/conversations/${id}`, { name });
      return response.data;
    },
    onSuccess: updatedConversation => {
      queryClient.setQueryData(['conversations'], (oldData: Conversation[] = []) =>
        oldData.map(conversation =>
          conversation.id === updatedConversation.id ? updatedConversation : conversation
        )
      );
    },
    onError: () => {
      toast({
        variant: 'destructive',
        description: 'Failed to update conversation',
      });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/conversations/${id}`);
      return response.data;
    },
    onSuccess: deletedConversation => {
      queryClient.setQueryData(['conversations'], (oldData: Conversation[] = []) =>
        oldData.filter(conversation => conversation.id !== deletedConversation.id)
      );
    },
    onError: () => {
      toast({
        variant: 'destructive',
        description: 'Failed to delete conversation',
      });
    },
  });

  return {
    conversations,
    isLoading,
    createConversation: createConversation.mutate,
    updateConversation: updateConversation.mutate,
    deleteConversation: deleteConversation.mutate,
  };
};
