import { MessageSquare, PanelLeftClose } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/lib/store';

export function SidebarHeader() {
  const { toggle } = useSidebarStore();

  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-6 h-6" />
        <span className="text-lg font-semibold">AI Companion</span>
      </div>
      <Button onClick={toggle} size="icon" variant="ghost" className="hidden lg:flex">
        <PanelLeftClose className="w-6 h-6" />
      </Button>
    </div>
  );
}
