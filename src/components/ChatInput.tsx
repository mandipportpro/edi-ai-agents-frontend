'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = isLoading || isStreaming || (!input.trim() && files.length === 0);

  const handleSend = () => {
    if (isDisabled) return;

    onSendMessage(input.trim(), files.length > 0 ? files : undefined);
    setInput('');
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      const validatedFiles: File[] = [];
      for (const f of selectedFiles) {
        // Check file size (limit to 10MB)
        if (f.size > 10 * 1024 * 1024) {
          alert(`File "${f.name}" exceeds 10MB and was skipped`);
          continue;
        }
        validatedFiles.push(f);
      }
      setFiles(prev => [...prev, ...validatedFiles]);
    }
  };

  const removeFileAtIndex = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current && files.length === 1) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      <div className="max-w-4xl mx-auto p-4">
        {/* File attachment preview */}
        {files.length > 0 && (
          <div className="mb-4 p-3 bg-gray-700 rounded-xl border border-gray-600 space-y-2">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <PaperClipIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFileAtIndex(idx)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="relative bg-gray-700 rounded-2xl border border-gray-600 focus-within:border-blue-500 transition-colors">
          <div className="flex items-end p-3">
            {/* File upload button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.csv,.json"
              multiple
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isStreaming}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-2"
              title="Attach files"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? "AI is responding..." : "Message AI Chat..."}
                disabled={isLoading || isStreaming}
                className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed py-2 px-1"
                style={{ minHeight: '24px', maxHeight: '120px' }}
                rows={1}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isDisabled}
              className="flex-shrink-0 ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              {isLoading || isStreaming ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {input.length > 0 && (
            <span className="mr-4">{input.length} characters</span>
          )}
          Supports text, PDFs, images, and more • Max 10MB • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

