'use client';

import { useAuth } from '@better-auth/react';
import ChatKitComponent from '@/src/components/ChatKitComponent';

export default function ChatPage() {
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Todo Assistant</h1>
          <p className="text-gray-600 mb-8">Please log in to start chatting with your AI assistant</p>
          {/* Login button would go here */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="container mx-auto p-4 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">AI Todo Assistant</h1>
          <ChatKitComponent userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}