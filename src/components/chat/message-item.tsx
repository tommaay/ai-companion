'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/types/message';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopying(true);
      toast({
        description: 'Message copied to clipboard',
        duration: 2000,
      });
      setTimeout(() => setCopying(false), 2000);
    } catch {
      toast({
        description: 'Failed to copy message',
        variant: 'destructive',
      });
    }
  };

  if (message.role === 'assistant') {
    return (
      <div className="flex items-end gap-2 max-w-[80%]">
        <Avatar className="mb-4 w-8 h-8">
          <AvatarImage src="/placeholder-ai.svg" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-2.5 text-sm">
            {message.content}
          </div>
          <div className="flex gap-2 items-center px-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:bg-secondary/80"
              onClick={() => handleCopy(message.content)}
            >
              {copying ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-none px-4 py-2.5 max-w-[80%] text-sm">
      {message.content}
    </div>
  );
}
