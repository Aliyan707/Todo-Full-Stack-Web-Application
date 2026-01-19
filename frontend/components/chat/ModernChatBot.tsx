'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChat } from '@/lib/hooks/useChat';
import styles from '@/components/chat/ModernChatBot.module.css';

export default function ModernChatBot() {
  const { user } = useAuth();
  const { messages, isLoading, error, sendMessage } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close chat when user is not authenticated
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
    }
  }, [user]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
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

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`${styles.floatingButton} ${isOpen ? styles.hidden : styles.visible}`}
        onClick={toggleChat}
        aria-label="Open AI Chat"
        title="AI Task Assistant"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.icon}
        >
          <path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H16.586L15.543 19.608C15.44 19.877 15.262 20.106 15.03 20.264C14.798 20.422 14.523 20.5 14.24 20.5H11.5C11.0333 20.5 10.5983 20.3833 10.225 20.15C9.85167 19.9167 9.575 19.6 9.425 19.25L8.425 16.75C8.325 16.5 8.18333 16.2917 8 16.125C7.81667 15.9583 7.6 15.875 7.35 15.875H5C4.46957 15.875 3.96086 15.6643 3.58579 15.2892C3.21071 14.9141 3 14.4054 3 13.875V6.125C3 5.59457 3.21071 5.08586 3.58579 4.71079C3.96086 4.33571 4.46957 4.125 5 4.125H19C19.5304 4.125 20.0391 4.33571 20.4142 4.71079C20.7893 5.08586 21 5.59457 21 6.125V15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 9H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.tooltip}>AI Assistant</span>
      </button>

      {/* Chat Container with Animation */}
      <div className={`${styles.chatContainer} ${isOpen ? styles.open : styles.closed}`}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerContent}>
            <h3>AI Task Assistant</h3>
            <p>Professional task management</p>
          </div>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {error && (
            <div className={styles.errorMessage}>
              <p>Error: {error}</p>
            </div>
          )}

          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <h4>Hello! 👋</h4>
              <p>I'm your AI task assistant. How can I help you today?</p>
              <div className={styles.quickActions}>
                <button
                  className={styles.quickActionBtn}
                  onClick={() => setInputValue('Add a task to buy groceries')}
                >
                  Add task
                </button>
                <button
                  className={styles.quickActionBtn}
                  onClick={() => setInputValue('Show my tasks')}
                >
                  Show tasks
                </button>
                <button
                  className={styles.quickActionBtn}
                  onClick={() => setInputValue('Mark task 1 as done')}
                >
                  Complete
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
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
                  <div className={styles.messageContent}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <textarea
            className={styles.messageInput}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add task: 'Buy groceries' | List: 'Show tasks' | Complete: 'Mark task 1 done'..."
            rows={1}
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
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}