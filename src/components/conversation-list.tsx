'use client';

import { useState } from 'react';
import { Edit2, MessageSquare, MoreVertical, Plus, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  name: string;
  lastMessageAt: Date;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingName(conversation.name);
  };

  const handleSave = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNew} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conversation => (
          <div
            key={conversation.id}
            className={cn(
              'group flex items-center gap-2 p-4 cursor-pointer hover:bg-muted/50',
              selectedId === conversation.id && 'bg-muted'
            )}
            onClick={() => onSelect(conversation.id)}
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
                          onDelete(conversation.id);
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
        ))}
      </div>
    </div>
  );
}
