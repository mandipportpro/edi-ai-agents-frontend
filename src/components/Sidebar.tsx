'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
}

export function Sidebar({ onNewChat, onSelectChat, currentChatId }: SidebarProps) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Getting started with AI',
      lastMessage: 'How can I help you today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      title: 'File upload question',
      lastMessage: 'I can help you analyze that document.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      title: 'Code review assistance',
      lastMessage: 'Let me review your code for you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(chats.filter(chat => chat.id !== chatId));
  };

  const renameChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Placeholder for rename functionality
    console.log('Rename chat:', chatId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-white">AI Chat</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isCollapsed ? <Bars3Icon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 
              text-white rounded-lg transition-colors border border-gray-700 hover:border-gray-600
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            <PlusIcon className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">New chat</span>}
          </button>
        </div>

        {/* Chat History */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Recent Chats
              </h2>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`
                    group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors
                    ${currentChatId === chat.id 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'hover:bg-gray-800/50'
                    }
                  `}
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(chat.timestamp)}
                    </p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                    <button
                      onClick={(e) => renameChat(chat.id, e)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="border-t border-gray-800 p-4">
          {session?.user && (
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
              )}
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Sign out"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu button */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-800 text-white rounded-lg shadow-lg"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      )}
    </>
  );
}

