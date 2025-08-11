'use client';

import { useEffect, useRef } from 'react';
import { UserCircleIcon, SparklesIcon, DocumentIcon } from '@heroicons/react/24/solid';
import { Message } from '@/types/chat';

interface ChatMessagesProps {
  messages: Message[];
  isStreaming?: boolean;
}

export function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-800">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6">
            <SparklesIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4">
            How can I help you today?
          </h2>
          <p className="text-gray-400 max-w-md text-lg">
            Start a conversation, upload files, or ask me anything. I&apos;m here to assist you with a wide range of tasks.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 mb-8 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.sender === 'ai' ? (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-3xl ${message.sender === 'user' ? 'text-right' : ''}`}>
                {/* File attachment indicator */}
                {message.files && message.files.length > 0 && (
                  <div className={`${message.sender === 'user' ? 'ml-auto' : ''}`}>
                    {message.files.map((file, idx) => (
                      <div key={idx} className={`inline-flex items-center space-x-2 mb-3 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 ${
                        message.sender === 'user' ? 'ml-2' : 'mr-2'
                      }`}>
                        <DocumentIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{file.name}</span>
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Message bubble */}
                <div
                  className={`inline-block max-w-full ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-3xl rounded-br-lg px-6 py-4'
                      : 'text-gray-100'
                  }`}
                >
                  {/* Message text */}
                  <div className={`prose prose-sm max-w-none ${
                    message.sender === 'user' 
                      ? 'prose-invert' 
                      : 'prose-gray prose-invert'
                  }`}>
                    {message.text.split('\n').map((line, lineIndex) => (
                      <p key={lineIndex} className={`${
                        message.sender === 'user' ? 'mb-0' : 'mb-4 last:mb-0'
                      } leading-relaxed`}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs text-gray-500 mt-2 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex items-start space-x-4 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-700 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-400 ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

