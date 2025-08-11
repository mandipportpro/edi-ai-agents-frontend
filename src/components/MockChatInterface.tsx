'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/chat';

export function MockChatInterface() {
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: '2',
      text: 'I need help with creating a modern chat interface. Can you show me some examples?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
    },
    {
      id: '3',
      text: 'Absolutely! I can help you create a modern chat interface. Here are some key design principles:\n\n1. **Clean Layout**: Use plenty of whitespace and clear visual hierarchy\n2. **Dark Theme**: Modern apps often use dark themes for better user experience\n3. **Responsive Design**: Ensure it works well on both desktop and mobile\n4. **Real-time Features**: Include typing indicators and instant message delivery\n5. **File Support**: Allow users to upload and share various file types\n\nWould you like me to elaborate on any of these points?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId('');
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    console.log('Selected chat:', chatId);
  };

  const handleSendMessage = async (text: string, files?: File[]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      files: files && files.length > 0 ? files.map(f => ({ name: f.name, type: f.type, size: f.size })) : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    // Simulate AI response
    setTimeout(() => {
      const filesText = files && files.length > 0 ? ` and your files: ${files.map(f => '"' + f.name + '"').join(', ')}` : '';
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I received your message: "${text}"${filesText}. This is a mock response to demonstrate the chat interface. In a real application, this would be connected to your Python backend with streaming responses.`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      setIsStreaming(false);
    }, 2000);
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
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}

