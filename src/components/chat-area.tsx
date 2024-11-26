'use client';

import { useAuth } from '@clerk/nextjs';
import { Copy, Check, Paperclip, ArrowUp, Menu, MessageSquare, PanelLeftOpen } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  sendMessage,
  getMessages,
  generateAndSaveAIResponse,
  type ChatMessage,
} from '@/app/actions/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ChatArea() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const { isOpen, toggle } = useSidebarStore();

  // Load messages when conversation changes
  useEffect(() => {
    if (!isSignedIn) return;
    const currentConversationId = searchParams.get('conversation');

    if (currentConversationId) {
      getMessages(currentConversationId).then(setMessages);
    }
  }, [searchParams, isSignedIn]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopying(messageId);
      toast({
        description: 'Message copied to clipboard',
        duration: 2000,
      });
      setTimeout(() => setCopying(null), 2000);
    } catch {
      toast({
        description: 'Failed to copy message',
        variant: 'destructive',
      });
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isSignedIn) {
      setError('Please sign in to send messages');
      return;
    }

    if (!message.trim()) {
      return;
    }

    const userMessage = message.trim();
    setMessage('');

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content: userMessage, role: 'user', createdAt: new Date() },
    ]);

    try {
      setIsLoading(true);
      setError(null);

      // Save user message
      const result = await sendMessage(userMessage, searchParams.get('conversation'));

      // Replace optimistic message with actual message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === Date.now().toString() ? result.message : msg))
      );

      // Generate and save AI response
      const aiResponse = await generateAndSaveAIResponse(userMessage, result.conversationId);
      if (aiResponse?.content) {
        setMessages((prev) => [...prev, aiResponse]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-background relative">
      <div className="lg:hidden flex items-center justify-between p-4 border-b sticky top-0 bg-background z-40">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => toggle()}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <span className="text-lg font-semibold">AI Companion</span>
        </div>
        <div className="w-10" />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'fixed left-4 top-4 z-50',
          'transition-all duration-500 ease-in-out',
          'hidden lg:flex',
          isOpen
            ? 'opacity-0 -translate-x-4 duration-200 pointer-events-none'
            : 'opacity-100 translate-x-0 delay-200'
        )}
        onClick={() => toggle()}
      >
        <PanelLeftOpen className="h-5 w-5" />
      </Button>
      <ScrollArea ref={scrollRef} className="flex-1 p-4 no-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          {error && (
            <div className="flex items-center justify-center p-4">
              <span className="text-error text-sm">{error}</span>
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
              {message.role === 'assistant' && (
                <div className="flex items-end gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 mb-4">
                    <AvatarImage src="/placeholder-ai.svg" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-2.5 text-sm">
                      {message.content}
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-secondary/80"
                        onClick={() => handleCopy(message.content, message.id)}
                      >
                        {copying === message.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {message.role === 'user' && (
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-none px-4 py-2.5 max-w-[80%] text-sm">
                  {message.content}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 max-w-[80%] mb-4">
              <Avatar className="h-8 w-8 mb-4">
                {/* Replace when we implement AI images and avatars */}
                {/* <AvatarImage src={avatar} /> */}
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-foreground/25 animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={onSubmit} className="border-t p-4 max-w-3xl mx-auto w-full">
        <div className="relative flex items-center bg-secondary rounded-2xl">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-background/50"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={1}
            placeholder="Message AI..."
            spellCheck={false}
            className="min-h-[44px] max-h-[168px] resize-none pr-12 pl-12 py-3 bg-transparent border-0 focus-visible:ring-0"
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 disabled:pointer-events-none"
            disabled={isLoading || !message.trim()}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
