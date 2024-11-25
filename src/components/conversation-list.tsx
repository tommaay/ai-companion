'use client';

import { useState } from 'react';
import { Edit2, MessageSquare, MoreVertical, Plus, Trash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/use-conversations';

interface Conversation {
  id: string;
  name: string;
  lastMessageAt: Date;
}

function ConversationListContent() {
  const { conversations, isLoading, createConversation, updateConversation, deleteConversation } =
    useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingName(conversation.name);
  };

  const handleSave = () => {
    if (editingId && editingName.trim()) {
      updateConversation({ id: editingId, name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingName('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <Button onClick={() => createConversation()} className="w-full" variant="secondary">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : conversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p>No conversations yet</p>
            <p className="text-sm">Create a new chat to get started</p>
          </div>
        ) : (
          conversations?.map((conversation: Conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'group flex items-center gap-2 p-4 cursor-pointer hover:bg-muted/50',
                selectedId === conversation.id && 'bg-muted'
              )}
              onClick={() => setSelectedId(conversation.id)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              {editingId === conversation.id ? (
                <Input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="h-8"
                  autoFocus
                />
              ) : (
                <>
                  <span className="flex-1 text-sm truncate">{conversation.name}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(conversation);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="sr-only">Edit conversation</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={e => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={e => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { ConversationListContent as ConversationList };
