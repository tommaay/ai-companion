import { clsx } from 'clsx';
import { MoreVertical, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  currentId?: string;
  editingId: string | null;
  editingName: string;
  onSelect: (id: string) => void;
  onEdit: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
  onEditNameChange: (name: string) => void;
}

export const ConversationList = ({
  conversations,
  isLoading,
  currentId,
  editingId,
  editingName,
  onSelect,
  onEdit,
  onDelete,
  onEditNameChange,
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-8 rounded-lg animate-pulse bg-muted" />
        <div className="h-8 rounded-lg animate-pulse bg-muted" />
        <div className="h-8 rounded-lg animate-pulse bg-muted" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-4 h-full text-center text-muted-foreground">
        <MessageSquare className="mb-2 w-8 h-8" />
        <p className="text-sm md:text-base">No conversations yet</p>
        <p className="text-xs md:text-sm">Create a new chat to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={clsx(
            'group flex items-center justify-between rounded-lg px-3 py-1 hover:bg-secondary',
            currentId === conversation.id && 'bg-secondary'
          )}
          onClick={() => onSelect(conversation.id)}
        >
          {editingId === conversation.id ? (
            <Input
              value={editingName}
              onChange={(e) => onEditNameChange(e.target.value)}
              onBlur={() => onEdit(conversation)}
              className="h-8 text-sm"
              autoFocus
            />
          ) : (
            <span className="text-sm truncate">{conversation.name}</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 w-8 h-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(conversation)}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(conversation.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </ScrollArea>
  );
};
