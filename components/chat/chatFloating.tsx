'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleChat } from './chatUI';

interface FloatingChatProps {
  sessionId: string;
}

export function FloatingChat({ sessionId }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 px-6 rounded-full shadow-lg z-40 gap-2"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">Chat</span>
      </Button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
          <div className="relative z-10 animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto">
            <Button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md z-10"
              size="icon"
              variant="secondary"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="border-4 border-primary rounded-xl shadow-2xl overflow-hidden">
              <SimpleChat sessionId={sessionId} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}