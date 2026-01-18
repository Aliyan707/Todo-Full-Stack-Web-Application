'use client';

/**
 * ChatInterface Component - AI-Powered Natural Language Todo Interface
 * Feature: 001-ai-todo-specs
 *
 * Main chat interface for interacting with the AI assistant.
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import styles from './ChatInterface.module.css';

export default function ChatInterface() {
  const { messages, isLoading, error, sendMessage, actionsTaken } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const messageText = input;
    setInput('');
    await sendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI Assistant</h2>
        <p className={styles.subtitle}>Ask me to manage your tasks using natural language</p>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Welcome! 👋</p>
            <p className={styles.emptyText}>
              I'm your AI todo assistant. Try commands like:
            </p>
            <ul className={styles.examplesList}>
              <li>"Add a task to buy milk"</li>
              <li>"Show my tasks"</li>
              <li>"Mark the first task as done"</li>
              <li>"What do I need to do today?"</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.role === 'user' ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <div className={styles.messageRole}>
              {message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
            </div>
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTime}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage} ${styles.loadingMessage}`}>
            <div className={styles.messageRole}>🤖 AI Assistant</div>
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {actionsTaken.length > 0 && (
          <div className={styles.actionsNotification}>
            <strong>Actions completed:</strong>
            <ul>
              {actionsTaken.map((action, idx) => (
                <li key={idx}>
                  {action.action}: {JSON.stringify(action.details)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          className={styles.input}
          rows={3}
          disabled={isLoading}
        />
        <button type="submit" className={styles.sendButton} disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
