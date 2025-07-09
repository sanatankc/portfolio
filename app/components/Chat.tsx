'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import { useDesktopSettings, WallpaperType } from '../lib/store';

interface ChatTheme {
  bg: string;
  text: string;
  border: string;
  inputBg: string;
  inputText: string;
  userBubble: string;
  aiBubble: string;
  userText: string;
  aiText: string;
}

import { AppProps } from '../lib/apps';

// Type definitions for tool invocation
interface ToolInvocation {
  state: 'partial-call' | 'call' | 'result';
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  result?: string | number | boolean | Record<string, unknown>;
}

const defaultTheme: ChatTheme = {
  bg: 'bg-gray-900',
  text: 'text-gray-100',
  border: 'border-gray-700',
  inputBg: 'bg-gray-800',
  inputText: 'text-gray-100',
  userBubble: 'bg-gray-200',
  aiBubble: 'bg-slate-700',
  userText: 'text-black',
  aiText: 'text-gray-100',
};

// Component to render tool invocation UI
const ToolInvocationCard = ({ toolInvocation, toolName, onThemeChange }: { 
  toolInvocation: ToolInvocation; 
  toolName: string;
  onThemeChange?: (theme: { background: string; foreground: string; closeButton: string; border: string }) => void;
}) => {
  const getToolIcon = (name: string) => {
    switch (name) {
      case 'calculate':
        return '🧮';
      case 'getCurrentTime':
        return '⏰';
      case 'wallpaper':
        return '🖼️';
      default:
        return '🔧';
    }
  };

  const getToolDisplayName = (name: string) => {
    switch (name) {
      case 'calculate':
        return 'Calculator';
      case 'getCurrentTime':
        return 'Current Time';
      case 'wallpaper':
        return 'Wallpaper Search';
      default:
        return name;
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{getToolIcon(toolName)}</span>
        <span className="font-medium text-blue-700 dark:text-blue-300">
          {getToolDisplayName(toolName)}
        </span>
        {toolInvocation.state === 'partial-call' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Calling...</span>
          </div>
        )}
        {toolInvocation.state === 'call' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Executing...</span>
          </div>
        )}
        {toolInvocation.state === 'result' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 dark:text-green-400">Complete</span>
          </div>
        )}
      </div>
      
      {toolInvocation.args && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Input:</strong> {JSON.stringify(toolInvocation.args, null, 2)}
        </div>
      )}
      
      {toolInvocation.result && (
        <>
          {toolName === 'wallpaper' && typeof toolInvocation.result === 'object' && toolInvocation.result !== null && 'images' in toolInvocation.result ? (
            <WallpaperSelector 
              wallpaperData={toolInvocation.result as { query: string; total: number; images: Array<{ id: string; description: string; urls: { regular: string; small: string; thumb: string }; user: { name: string; username: string }; likes: number; color: string; }> }}
              onThemeChange={onThemeChange}
            />
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <strong>Result:</strong> {typeof toolInvocation.result === 'string' ? toolInvocation.result : JSON.stringify(toolInvocation.result, null, 2)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Component for wallpaper selection
const WallpaperSelector = ({ wallpaperData, onThemeChange }: { 
  wallpaperData: { 
    query: string; 
    total: number; 
    images: Array<{
      id: string;
      description: string;
      urls: { regular: string; small: string; thumb: string };
      user: { name: string; username: string };
      likes: number;
      color: string;
    }>;
  };
  onThemeChange?: (theme: { background: string; foreground: string; closeButton: string; border: string }) => void;
}) => {
  const { addWallpaper } = useDesktopSettings();
  const [selectedImageId, setSelectedImageId] = useState<string>(wallpaperData.images[0]?.id || '');
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(wallpaperData.images[0]?.urls.regular || '');

  // Set the first image as wallpaper on mount
  useEffect(() => {
    if (wallpaperData.images[0]) {
      const firstImage = wallpaperData.images[0];
      const wallpaper: WallpaperType = { 
        type: 'image', 
        value: firstImage.urls.regular 
      };
      addWallpaper(wallpaper);
      setCurrentWallpaper(firstImage.urls.regular);
      
      // Update window theme
      if (onThemeChange) {
        onThemeChange({
          background: firstImage.color || '#111827',
          foreground: '#ffffff',
          closeButton: '#ef4444',
          border: firstImage.color || '#374151',
        });
      }
    }
  }, [wallpaperData.images, addWallpaper, onThemeChange]);

  const handleImageSelect = (image: typeof wallpaperData.images[0]) => {
    setSelectedImageId(image.id);
    setCurrentWallpaper(image.urls.regular);
    
    // Set desktop wallpaper using the store
    const wallpaper: WallpaperType = { 
      type: 'image', 
      value: image.urls.regular 
    };
    addWallpaper(wallpaper);
    
    // Update the window theme based on the image color
    if (onThemeChange) {
      onThemeChange({
        background: image.color || '#111827',
        foreground: '#ffffff',
        closeButton: '#ef4444',
        border: image.color || '#374151',
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🖼️</span>
        <span className="font-medium text-purple-700 dark:text-purple-300">
          Wallpaper Collection
        </span>
                 <span className="text-sm text-purple-600 dark:text-purple-400">
           {wallpaperData.total} results for &ldquo;{wallpaperData.query}&rdquo;
         </span>
      </div>
      
      {/* Current wallpaper preview */}
      <div className="mb-4">
        <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-200 dark:bg-gray-700">
          {currentWallpaper && (
            <img 
              src={currentWallpaper} 
              alt="Selected wallpaper" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="absolute bottom-2 left-2 bg-green-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <span>✓</span> Desktop Wallpaper
          </div>
        </div>
      </div>

      {/* Horizontal scroll of thumbnails */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose a wallpaper:</h4>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600">
          {wallpaperData.images.map((image) => (
            <div
              key={image.id}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedImageId === image.id 
                  ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-105' 
                  : 'hover:scale-105 hover:ring-1 hover:ring-purple-300'
              }`}
              onClick={() => handleImageSelect(image)}
              title={image.description}
            >
              <img 
                src={image.urls.thumb} 
                alt={image.description}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="${image.color}"/><text x="40" y="40" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12">No Image</text></svg>`;
                }}
              />
              {selectedImageId === image.id && (
                <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                <div className="text-white text-xs truncate">
                  ❤️ {image.likes}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Image info */}
      {selectedImageId && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded flex items-center gap-1">
            <span>✓</span> Wallpaper set successfully! You can also find it in Settings → Display.
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div className="flex justify-between items-center">
              <span>
                <strong>By:</strong> {wallpaperData.images.find(img => img.id === selectedImageId)?.user.name}
              </span>
              <span>
                <strong>Likes:</strong> {wallpaperData.images.find(img => img.id === selectedImageId)?.likes}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Chat({ fx, onThemeChange }: AppProps) {
  // fx is available for future use
  void fx;
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you today?",
      }
    ],
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set window theme on mount
  useEffect(() => {
    if (onThemeChange) {
      onThemeChange({
        background: '#111827', // gray-900
        foreground: '#f9fafb', // gray-100
        closeButton: '#ef4444', // red-500
        border: '#374151', // gray-700
      });
    }
  }, [onThemeChange]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  console.log(messages);

  return (
    <div className={`h-full flex flex-col bg-white text-black`}>
      {/* Header */}
      <div className={`p-3 border-b ${defaultTheme.border} flex items-center justify-between`}>
        <h2 className="font-semibold">AI Chat</h2>
        <div className="text-sm text-gray-400">
          {messages.length - 1} messages
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 ${
                message.role === 'user'
                  ? `${defaultTheme.userBubble} ${defaultTheme.userText} border-pixel-sm-[#c0c0c0]`
                  : `${defaultTheme.aiBubble} ${defaultTheme.aiText} border-pixel-sm-slate-700`
              }`}
            >
              {/* Render message parts */}
              {message.parts ? (
                <div className="space-y-2">
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return (
                        <div key={index} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    } else if (part.type === 'tool-invocation') {
                      return (
                        <ToolInvocationCard
                          key={index}
                          toolInvocation={part.toolInvocation}
                          toolName={part.toolInvocation.toolName}
                          onThemeChange={onThemeChange}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                /* Fallback for messages without parts */
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
              
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-slate-900' : 'text-gray-400'
              }`}>
                {formatTime(message.createdAt || new Date())}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${defaultTheme.aiBubble} ${defaultTheme.aiText}`}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${defaultTheme.border}`}>
        <form onSubmit={handleSubmit} className="flex space-x-2 items-end">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className={`flex-1 p-2 resize-none border-pixel-lg-black bg-black/10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={Math.min(3, input.split('\n').length)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`px-4 max-h-[54px] py-2 border-pixel-lg-black/50  bg-black text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 transition-colors`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 