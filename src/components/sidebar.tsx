'use client';

import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import { MessageSquare, MoreVertical, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation,
} from '@/app/actions/conversations';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createUrl } from '@/lib/url';
import type { Conversation } from '@/types';

export function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get the current conversation ID from URL params
  const currentId = searchParams.get('conversation');

  // Fetch conversations on mount
  useEffect(() => {
    async function initializeConversations() {
      try {
        if (!isSignedIn) {
          setIsLoading(false);
          return;
        }

        const data = await getConversations();
        setConversations(data);

        // If no conversations exist and no conversation is selected, create one
        if (data.length === 0 && !currentId) {
          const newConversation = await createConversation();
          setConversations([newConversation]);
          // Navigate to the new conversation
          const params = new URLSearchParams();
          params.set('conversation', newConversation.id);
          router.push(createUrl('/', params));
        } else if (data.length > 0 && !currentId) {
          // If conversations exist but none selected, select the most recent one
          const params = new URLSearchParams();
          params.set('conversation', data[0].id);
          router.push(createUrl('/', params));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize conversations:', error);
        setIsLoading(false);
      }
    }

    initializeConversations();
  }, [currentId, router, isSignedIn]);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const newConversation = await createConversation();
      setConversations(prev => [newConversation, ...prev]);
      const params = new URLSearchParams();
      params.set('conversation', newConversation.id);
      router.push(createUrl('/', params));
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (conversation: Conversation) => {
    if (editingId === conversation.id) {
      try {
        setIsLoading(true);
        const updated = await updateConversation(conversation.id, editingName);
        setConversations(prev => prev.map(conv => (conv.id === updated.id ? updated : conv)));
        setEditingId(null);
        setEditingName('');
      } catch (error) {
        console.error('Failed to update conversation:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setEditingId(conversation.id);
      setEditingName(conversation.name);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (currentId === id) {
        const remaining = conversations.filter(c => c.id !== id);
        const params = new URLSearchParams();
        if (remaining.length > 0) {
          params.set('conversation', remaining[0].id);
          router.push(createUrl('/', params));
        } else {
          params.delete('conversation');
          router.push(createUrl('/', params));
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    const params = new URLSearchParams();
    params.set('conversation', id);
    router.push(createUrl('/', params));
  };

  return (
    <div className="flex flex-col h-full w-[280px] bg-background text-primary p-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <span className="text-lg font-semibold">AI Companion</span>
        </div>
      </div>
      <Button
        onClick={handleCreate}
        variant="outline"
        className="mb-2 bg-secondary border-border hover:bg-secondary/80 text-primary"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
      <div className="flex-1 py-2 space-y-4">
        <div className="pt-4 border-t border-border">
          <h2 className="mb-2 text-xs font-semibold text-muted-foreground">Recent Chats</h2>
          <ScrollArea className="h-[calc(100vh-280px)]">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-8 bg-muted animate-pulse rounded-lg" />
                <div className="h-8 bg-muted animate-pulse rounded-lg" />
                <div className="h-8 bg-muted animate-pulse rounded-lg" />
              </div>
            ) : conversations?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-4 text-center">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p className="text-sm md:text-base">No conversations yet</p>
                <p className="text-xs md:text-sm">Create a new chat to get started</p>
              </div>
            ) : (
              conversations?.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  className={clsx(
                    'group flex items-center justify-between rounded-lg px-2 py-2 hover:bg-secondary',
                    currentId === conversation.id && 'bg-secondary'
                  )}
                  onClick={() => handleSelect(conversation.id)}
                >
                  {editingId === conversation.id ? (
                    <Input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => handleEdit(conversation)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm truncate">{conversation.name}</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(conversation)}>
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(conversation.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      </div>
      <div className="py-4 border-t border-border flex items-center justify-between">
        {!isSignedIn ? (
          <SignInButton>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </SignInButton>
        ) : (
          <UserButton />
        )}
        <ModeToggle />
      </div>
    </div>
  );
}
