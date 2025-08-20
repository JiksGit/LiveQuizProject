import { Heart, Share2, Users, Eye, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StreamInfo } from './StreamingRoom';

interface StreamHeaderProps {
  streamInfo: StreamInfo;
  isFollowing: boolean;
  onFollow: () => void;
}

export function StreamHeader({ streamInfo, isFollowing, onFollow }: StreamHeaderProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* 스트리머 정보 */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={streamInfo.streamerAvatar} alt={streamInfo.streamerName} />
            <AvatarFallback>
              {streamInfo.streamerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="truncate">{streamInfo.title}</h2>
              {streamInfo.isLive && (
                <Badge variant="destructive" className="text-xs">
                  LIVE
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <span>{streamInfo.streamerName}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(streamInfo.viewCount)}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{formatNumber(streamInfo.followers)} 팔로워</span>
              </span>
              
              <Badge variant="secondary" className="text-xs">
                {streamInfo.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center space-x-2">
          <Button 
            variant={isFollowing ? "secondary" : "default"}
            onClick={onFollow}
            className="flex items-center space-x-2"
          >
            <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
            <span>{isFollowing ? '팔로잉' : '팔로우'}</span>
          </Button>
          
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>방송 시작: 2시간 전</span>
          </span>
          
          <span>•</span>
          
          <span>최대 동시 시청자: {formatNumber(streamInfo.viewCount + 453)}</span>
        </div>
      </div>
    </div>
  );
}