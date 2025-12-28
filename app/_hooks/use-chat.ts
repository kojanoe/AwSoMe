'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import { initializeRAG, isRAGReady } from '@/lib/chat/initRAG';

interface UseChatProps {
  sessionId: string;
}

export function useChat({ sessionId }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize RAG on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);
        
        // Check if already ready
        const ready = await isRAGReady(sessionId);
        
        if (!ready) {
          // Initialize chunks and embeddings
          await initializeRAG(sessionId);
        }
        
        setIsInitializing(false);
      } catch (err) {
        console.error('RAG initialization error:', err);
        setError('Failed to initialize chat. Please refresh the page.');
        setIsInitializing(false);
      }
    };

    initialize();
  }, [sessionId]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || isInitializing) return;

    // Add user message to conversation
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      //Search for relevant chunks using semantic search
      const { semanticSearch, buildContext } = await import('@/lib/chat/embeddings/semanticSearch');
      const searchResults = await semanticSearch(message, sessionId, 5);
      
      //Build context from top results
      const context = buildContext(searchResults);
      
      //Prepare messages for API (last 5 messages for context)
      const conversationHistory = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      conversationHistory.push({
        role: 'user',
        content: message
      });
      
      //Call chat API with context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          context: context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    clearConversation,
  };
}