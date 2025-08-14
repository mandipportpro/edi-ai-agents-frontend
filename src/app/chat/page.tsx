'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { Header } from '@/components/Header';
import { useChat } from '@/hooks/useChat';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { messages, isLoading, isStreaming, sendMessage, clearChat } = useChat();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <Header onClearChat={clearChat} />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatMessages messages={messages} isStreaming={isStreaming} />
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}

