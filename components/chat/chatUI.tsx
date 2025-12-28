'use client';

import { useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatBubble } from './chatBubble';
import { ChatInput } from './chatInput';
import { useChat } from '@/app/_hooks/use-chat';

interface SimpleChatProps {
  sessionId: string;
}

export function SimpleChat({ sessionId }: SimpleChatProps) {
  const {
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    clearConversation,
  } = useChat({ sessionId });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="w-[400px] h-[600px] flex flex-col bg-secondary">
      <CardHeader className="flex-shrink-0 bg-secondary">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat</CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearConversation}
              className="h-8 w-8"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden bg-secondary">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Spinner className="h-8 w-8 mx-auto" />
              <p className="text-muted-foreground text-sm">
                Preparing your data...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length > 0 ? (
                <>
                  {messages.map((message) => (
                    <ChatBubble 
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg bg-card px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground text-sm">
                      Ask me anything about your Instagram usage patterns
                    </p>
                    <p className="text-xs text-muted-foreground">
                      I'll remember our conversation as we chat
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 border-t pt-4 bg-secondary">
              <ChatInput 
                onSubmit={sendMessage}
                disabled={isLoading || isInitializing}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}