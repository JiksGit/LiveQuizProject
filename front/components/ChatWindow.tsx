import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChatMessage as ChatMessageType } from './StreamingRoom';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
}

export function ChatWindow({ messages, onSendMessage }: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg h-[500px] flex flex-col">
      {/* 채팅 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">실시간 채팅</span>
        </div>
        <Button variant="ghost" size="sm" className="p-1">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* 메시지 목록 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
            maxLength={200}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!inputMessage.trim()}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {inputMessage.length}/200
        </div>
      </form>
    </div>
  );
}