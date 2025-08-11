'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { useChat } from '@/hooks/useChat';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string>('');
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

  const handleNewChat = () => {
    clearChat();
    setCurrentChatId('');
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // In a real app, you would load the chat messages for this chat ID
    console.log('Selected chat:', chatId);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
      />
      
      {/* Main Chat Area */}
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

