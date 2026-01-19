'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ChatPopup from '@/components/chat/ChatPopup';
import styles from '@/components/chat/FloatingChatButton.module.css';

export default function FloatingChatButton() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!user) {
    return null; // Don't show the button if user is not authenticated
  }

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <button
        className={styles.floatingButton}
        onClick={handleOpenChat}
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
        <span className={styles.tooltip}>AI Chat</span>
      </button>

      <ChatPopup isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}