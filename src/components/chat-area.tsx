'use client';

import { useEffect, useRef } from 'react';

import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageItem } from '@/components/chat/message-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessages } from '@/hooks/use-messages';
import { cn } from '@/lib/utils';

export function ChatArea() {
  const { messages, isLoading, error, sendMessageToAI } = useMessages();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex relative flex-col flex-1 h-full bg-background">
      <ChatHeader />
      <ScrollArea ref={scrollRef} className="flex-1 p-4 no-scrollbar">
        <div className="mx-auto space-y-8 max-w-3xl">
          {error && (
            <div className="flex justify-center items-center p-4">
              <span className="text-sm text-error">{error}</span>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end mb-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <MessageItem message={message} />
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 max-w-[80%] mb-4">
              <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full animate-bounce bg-foreground/25"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <ChatInput onSend={sendMessageToAI} isLoading={isLoading} />
    </div>
  );
}
