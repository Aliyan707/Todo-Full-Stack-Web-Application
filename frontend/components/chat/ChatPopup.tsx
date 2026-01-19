'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChat } from '@/lib/hooks/useChat';
import styles from '@/components/chat/ChatInterface.module.css';
import Button from '@/components/shared/Button';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const { user } = useAuth();
  const { messages, isLoading, error, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div
        className={styles.popupContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>AI Task Assistant</h2>
            <p>Ask me to add, list, complete, or delete tasks</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close chat"
          >
            ✕
          </Button>
        </div>

        {/* Messages Container */}
        <div className={styles.messagesContainer}>
          {error && (
            <div className={styles.error}>
              <p>Error: {error}</p>
            </div>
          )}

          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Hello! 👋</h3>
              <p className={styles.emptyText}>
                I'm your AI task assistant. How can I help you today?
              </p>
              <ul className={styles.examplesList}>
                <li>Add a task to buy groceries</li>
                <li>Show my tasks</li>
                <li>Mark task 1 as done</li>
                <li>Delete task 2</li>
              </ul>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <div className={styles.messageRole}>
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                  <div className={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistantMessage} ${styles.loadingMessage}`}>
                  <div className={styles.messageRole}>AI Assistant</div>
                  <div className={styles.messageContent}>
                    <div className={styles.loadingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <textarea
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me to add, list, complete, or delete tasks..."
            rows={2}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}