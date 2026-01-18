/**
 * Chat API Client - AI-Powered Natural Language Todo Interface
 * Feature: 001-ai-todo-specs
 *
 * API methods for chat functionality with AI assistant.
 */

import { apiPost, apiGet } from './client';
import { APIResponse } from '@/types/api';

/**
 * Message in a conversation
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  conversationId: string;
}

/**
 * Action taken by the AI assistant
 */
export interface ActionResult {
  action: string;
  details: Record<string, any>;
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  message: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

/**
 * Chat response from backend
 */
export interface ChatResponse {
  success: boolean;
  conversationId?: string;
  response?: string;
  actionsTaken: ActionResult[];
  timestamp?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Conversation metadata
 */
export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Send a message to the AI assistant
 * POST /api/{user_id}/chat
 */
export async function sendChatMessage(
  userId: string,
  request: ChatRequest
): Promise<APIResponse<ChatResponse>> {
  return apiPost<ChatResponse>(`/api/${userId}/chat`, request);
}

/**
 * Get conversation history for a user
 * GET /api/{user_id}/conversations
 */
export async function getConversations(
  userId: string
): Promise<APIResponse<{ conversations: Conversation[] }>> {
  return apiGet<{ conversations: Conversation[] }>(`/api/${userId}/conversations`);
}

/**
 * Get messages for a specific conversation
 * GET /api/{user_id}/conversations/{conversation_id}/messages
 */
export async function getConversationMessages(
  userId: string,
  conversationId: string
): Promise<APIResponse<{ messages: ChatMessage[] }>> {
  return apiGet<{ messages: ChatMessage[] }>(
    `/api/${userId}/conversations/${conversationId}/messages`
  );
}
