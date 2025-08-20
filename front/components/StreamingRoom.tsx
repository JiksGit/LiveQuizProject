import { useState, useEffect, useRef } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { ChatWindow } from './ChatWindow';
import { ViewerList } from './ViewerList';
import { StreamHeader } from './StreamHeader';
import { DarkModeToggle } from './DarkModeToggle';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isOwner?: boolean;
  isModerator?: boolean;
}

export interface Viewer {
  id: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
}

export interface StreamInfo {
  title: string;
  streamerName: string;
  streamerAvatar: string;
  category: string;
  viewCount: number;
  followers: number;
  isLive: boolean;
}

export function StreamingRoom() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [currentUser] = useState({ username: 'viewer123', isFollowing: false });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showViewerList, setShowViewerList] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);

  const streamInfo: StreamInfo = {
    title: "오늘도 즐거운 게임 방송! 🎮",
    streamerName: "StreamerKing",
    streamerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    category: "게임",
    viewCount: 1247,
    followers: 8923,
    isLive: true
  };

  // 목 WebSocket 연결 시뮬레이션
  useEffect(() => {
    // 초기 시청자 목록
    const initialViewers: Viewer[] = [
      { id: '1', username: 'gamer01', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face', isFollowing: true },
      { id: '2', username: 'viewer123', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face', isFollowing: false },
      { id: '3', username: 'chatmaster', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face', isFollowing: true },
      { id: '4', username: 'streamerking', avatar: streamInfo.streamerAvatar, isFollowing: false },
    ];
    setViewers(initialViewers);

    // 초기 채팅 메시지
    const initialMessages: ChatMessage[] = [
      { id: '1', username: 'streamerking', message: '안녕하세요! 오늘도 재미있게 방송해보겠습니다!', timestamp: new Date(Date.now() - 300000), isOwner: true },
      { id: '2', username: 'gamer01', message: '오늘 뭐 할 예정이에요?', timestamp: new Date(Date.now() - 240000) },
      { id: '3', username: 'chatmaster', message: '팔로우 했어요! 항상 재미있는 방송 감사합니다 ❤️', timestamp: new Date(Date.now() - 180000) },
    ];
    setMessages(initialMessages);

    // 목 메시지 생성 시뮬레이션
    const messageInterval = setInterval(() => {
      const mockMessages = [
        '와 대박!',
        '이거 어떻게 하는 거예요?',
        'ㅋㅋㅋㅋㅋ',
        '팔로우 완료!',
        '스킬 개쩐다',
        '다음엔 뭐 할 예정인가요?',
        '오늘 방송 너무 재밌어요!',
        '구독 눌렀습니다!',
        '화이팅!',
        '대단하네요 👍'
      ];
      
      const usernames = ['viewer789', 'gamer02', 'newbie', 'pro_player', 'fan123'];
      const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        username: randomUser,
        message: randomMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev.slice(-49), newMessage]);
    }, 3000 + Math.random() * 5000);

    return () => {
      clearInterval(messageInterval);
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: currentUser.username,
      message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // 실제 구현에서는 WebSocket을 통해 서버에 전송
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-primary">LiveStream Platform</h1>
          <DarkModeToggle />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 왼쪽: 비디오 및 스트림 정보 */}
          <div className="lg:col-span-3 space-y-4">
            <VideoPlayer />
            <StreamHeader 
              streamInfo={streamInfo}
              isFollowing={isFollowing}
              onFollow={handleFollow}
            />
          </div>

          {/* 오른쪽: 채팅 및 시청자 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex space-x-2 lg:hidden">
              <button 
                onClick={() => setShowViewerList(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${!showViewerList ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                채팅
              </button>
              <button 
                onClick={() => setShowViewerList(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${showViewerList ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                시청자 ({viewers.length})
              </button>
            </div>

            <div className="lg:hidden">
              {showViewerList ? (
                <ViewerList viewers={viewers} />
              ) : (
                <ChatWindow 
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>

            <div className="hidden lg:block space-y-4">
              <ChatWindow 
                messages={messages}
                onSendMessage={handleSendMessage}
              />
              <ViewerList viewers={viewers} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}