'use client';

import { MessageSquare, Menu, PanelLeftOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function ChatHeader() {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <>
      <div className="flex sticky top-0 z-40 justify-between items-center p-4 border-b lg:hidden bg-background">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => toggle()}>
          <Menu className="w-6 h-6" />
        </Button>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-6 h-6" />
          <span className="text-lg font-semibold">AI Companion</span>
        </div>
        <div className="w-10" />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'fixed top-4 left-4 z-50',
          'transition-all duration-500 ease-in-out',
          'hidden lg:flex',
          isOpen
            ? 'opacity-0 duration-200 -translate-x-4 pointer-events-none'
            : 'opacity-100 delay-200 translate-x-0'
        )}
        onClick={() => toggle()}
      >
        <PanelLeftOpen className="w-5 h-5" />
      </Button>
    </>
  );
}
