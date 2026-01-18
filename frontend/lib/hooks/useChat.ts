/**
 * useChat Hook - AI-Powered Natural Language Todo Interface
 * Feature: 001-ai-todo-specs
 *
 * Custom hook for chat functionality with AI assistant.
 */

import { useState, useCallback, useEffect } from 'react';
import { sendChatMessage, ChatMessage, ChatRequest, ChatResponse, ActionResult } from '@/lib/api/chat';
import { unwrapAPIResponse } from '@/lib/api/client';
import { useAuth } from './useAuth';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearConversation: () => void;
  actionsTaken: ActionResult[];
}

export function useChat(initialConversationId?: string): UseChatReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [actionsTaken, setActionsTaken] = useState<ActionResult[]>([]);

  /**
   * Send a message to the AI assistant
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      if (!message.trim()) {
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        conversationId: conversationId || 'new',
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const request: ChatRequest = {
          message,
          conversationId: conversationId || undefined,
        };

        const response = await sendChatMessage(user.id, request);
        const data: ChatResponse = unwrapAPIResponse(response);

        // Update conversation ID if this is a new conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        // Add assistant response to messages
        if (data.response) {
          const assistantMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.response,
            timestamp: data.timestamp || new Date().toISOString(),
            conversationId: data.conversationId || conversationId || 'new',
          };

          setMessages((prev) => [...prev, assistantMessage]);
        }

        // Store actions taken
        if (data.actionsTaken && data.actionsTaken.length > 0) {
          setActionsTaken(data.actionsTaken);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        console.error('Send message error:', err);

        // Remove the temporary user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [user, conversationId]
  );

  /**
   * Clear the current conversation
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setActionsTaken([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    actionsTaken,
  };
}
