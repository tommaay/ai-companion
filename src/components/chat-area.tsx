'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Volume2, Copy, ThumbsUp, ThumbsDown, Paperclip, ArrowUp, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { sendMessage, getMessages, type ChatMessage } from '@/app/actions/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export function ChatArea() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      getMessages(conversationId).then(setMessages);
    }
  }, [conversationId]);

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

  const onSubmit = async (data: MessageFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await sendMessage(data.message, conversationId);
      setMessages(prev => [...prev, result.message]);
      reset();
      inputRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-background">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {error && (
            <div className="flex items-center justify-center p-4">
              <span className="text-error text-sm">{error}</span>
            </div>
          )}
          {messages.map(message => (
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
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-secondary/80">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-secondary/80"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-secondary/80"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
                <AvatarImage src="/placeholder-ai.svg" />
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
      <form onSubmit={handleSubmit(onSubmit)} className="border-t p-4 max-w-3xl mx-auto w-full">
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
            {...register('message')}
            ref={e => {
              if (e) {
                register('message').ref(e);
                Object.defineProperty(inputRef, 'current', {
                  value: e,
                  writable: true,
                });
              }
            }}
            rows={1}
            placeholder="Message AI..."
            spellCheck={false}
            className={cn(
              'min-h-[44px] max-h-[168px] resize-none pr-12 pl-12 py-3 bg-transparent border-0 focus-visible:ring-0',
              errors.message && 'border-error'
            )}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
        {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
      </form>
    </div>
  );
}
