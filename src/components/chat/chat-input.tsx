'use client';

import { Paperclip, ArrowUp } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    await onSend(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mx-auto w-full max-w-3xl border-t">
      <div className="flex relative items-center rounded-2xl bg-secondary">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute left-2 top-1/2 w-8 h-8 -translate-y-1/2 text-muted-foreground hover:bg-background/50"
        >
          <Paperclip className="w-5 h-5" />
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
          className="absolute right-2 top-1/2 w-8 h-8 -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:pointer-events-none"
          disabled={isLoading || !message.trim()}
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}
