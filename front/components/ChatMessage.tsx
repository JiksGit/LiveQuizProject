import { Crown, Shield } from 'lucide-react';
import { ChatMessage as ChatMessageType } from './StreamingRoom';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getUsernameColor = (username: string) => {
    if (message.isOwner) return 'text-yellow-500';
    if (message.isModerator) return 'text-green-500';
    
    // 사용자 이름에 따른 색상 생성
    const colors = [
      'text-blue-500',
      'text-purple-500',
      'text-pink-500',
      'text-indigo-500',
      'text-cyan-500',
      'text-emerald-500',
      'text-orange-500',
      'text-red-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex items-start space-x-2 group hover:bg-muted/30 p-1 rounded text-sm">
      <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
        {formatTime(message.timestamp)}
      </span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1">
          <span className={`truncate ${getUsernameColor(message.username)}`}>
            {message.username}
          </span>
          
          {message.isOwner && (
            <Crown className="w-3 h-3 text-yellow-500" />
          )}
          
          {message.isModerator && (
            <Shield className="w-3 h-3 text-green-500" />
          )}
          
          <span className="text-muted-foreground">:</span>
        </div>
        
        <p className="break-words text-foreground mt-0.5 leading-relaxed">
          {message.message}
        </p>
      </div>
    </div>
  );
}