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

  // WebSocket 연결
  useEffect(() => {
    // 초기 시청자 목록 (목업)
    const initialViewers: Viewer[] = [
      { id: '1', username: 'gamer01', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face', isFollowing: true },
      { id: '2', username: 'viewer123', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face', isFollowing: false },
      { id: '3', username: 'chatmaster', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face', isFollowing: true },
      { id: '4', username: 'streamerking', avatar: streamInfo.streamerAvatar, isFollowing: false },
    ];
    setViewers(initialViewers);

    // 초기 메시지 (스트리머 안내)
    const initialMessages: ChatMessage[] = [
      { id: '1', username: 'streamerking', message: '안녕하세요! 오늘도 재미있게 방송해보겠습니다!', timestamp: new Date(Date.now() - 300000), isOwner: true }
    ];
    setMessages(initialMessages);

    const getWebSocketUrl = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const { hostname, port } = window.location;
        // 개발 서버(예: 5173, 3000 등)에서 실행 중이면 백엔드 기본 포트 8080으로 연결
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          if (port && port !== '8080') {
            return `${protocol}://localhost:8080/ws/chat`;
          }
        }
        // 동일 출처 배포 환경
        return `${protocol}://${window.location.host}/ws/chat`;
      } catch {
        return 'ws://localhost:8080/ws/chat';
      }
    };

    const socket = new WebSocket(getWebSocketUrl());
    websocketRef.current = socket;

    socket.onopen = () => {
      // 연결 성공 시스템 메시지
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), username: 'system', message: '서버와 연결되었습니다.', timestamp: new Date() }
      ]);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' || data.type === 'system') {
          const incoming: ChatMessage = {
            id: data.id || Date.now().toString(),
            username: data.username || 'anonymous',
            message: data.message || '',
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
          };
          setMessages(prev => [...prev.slice(-99), incoming]);
        } else if (data.type === 'follow') {
          const incoming: ChatMessage = {
            id: Date.now().toString(),
            username: 'system',
            message: `${data.username || 'anonymous'} 님이 팔로우했습니다.`,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
          };
          setMessages(prev => [...prev.slice(-99), incoming]);
        }
      } catch (e) {
        // 무시: 서버에서 텍스트가 아닌 데이터가 올 경우
      }
    };

    socket.onerror = () => {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), username: 'system', message: 'WebSocket 오류가 발생했습니다.', timestamp: new Date() }
      ]);
    };

    socket.onclose = () => {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), username: 'system', message: '서버 연결이 종료되었습니다.', timestamp: new Date() }
      ]);
    };

    return () => {
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
    // 낙관적 업데이트
    setMessages(prev => [...prev, newMessage]);

    // 서버로 전송
    try {
      websocketRef.current?.send(
        JSON.stringify({ type: 'message', username: currentUser.username, message })
      );
    } catch {
      // 전송 실패시 무시
    }
  };

  const handleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      websocketRef.current?.send(
        JSON.stringify({ type: 'follow', username: currentUser.username })
      );
    } catch {}
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