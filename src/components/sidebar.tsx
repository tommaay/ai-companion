'use client';

import { SignInButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { clsx } from 'clsx';
import { Bot, Folder, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { ModeToggle } from '@/components/mode-toggle';
import { ConversationList } from '@/components/sidebar/conversation-list';
import { SidebarHeader } from '@/components/sidebar/sidebar-header';
import { Button } from '@/components/ui/button';
import { useConversations } from '@/hooks/use-conversations';
import { useSidebarStore } from '@/lib/store';

export function Sidebar() {
  const searchParams = useSearchParams();
  const currentId = searchParams.get('conversation');
  const { isOpen, toggle } = useSidebarStore();
  const { isSignedIn } = useAuth();
  const {
    conversations,
    isLoading,
    editingId,
    editingName,
    setEditingName,
    handleEdit,
    handleDelete,
    handleSelect,
    loadConversations,
    handleCreate,
  } = useConversations();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <aside
      className={clsx(
        'flex fixed inset-y-0 left-0 z-50 flex-col w-[280px] bg-background text-primary',
        'transition-transform duration-300 ease-in-out transform',
        'lg:relative',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div
        className={clsx(
          'fixed inset-0 z-40 backdrop-blur-sm bg-background/80',
          'lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggle}
      />
      <div className="flex flex-col h-full">
        <SidebarHeader />
        <div className="flex flex-col flex-1 gap-4 p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="flex justify-start w-full text-muted-foreground hover:text-primary"
            >
              <Bot className="mr-2 w-5 h-5" />
              Companion Settings
            </Button>
            <Button
              variant="ghost"
              className="flex justify-start w-full text-muted-foreground hover:text-primary"
            >
              <Folder className="mr-2 w-5 h-5" />
              Images
            </Button>
          </div>
          <div className="pt-4 border-t border-border">
            <h2 className="mb-2 text-xs font-semibold text-muted-foreground">Recent Chats</h2>
            <Button
              onClick={handleCreate}
              className="flex justify-center items-center mt-3 mb-4 w-full text-muted-foreground hover:text-primary"
              variant="outline"
            >
              <Plus />
              New Conversation
            </Button>
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              currentId={currentId ?? undefined}
              editingId={editingId}
              editingName={editingName}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onEditNameChange={setEditingName}
            />
          </div>
        </div>
        <div className="p-4 border-t border-border">
          {!isSignedIn ? (
            <SignInButton>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
          ) : (
            <div className="flex justify-between items-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
              <ModeToggle />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
