import { Users, Crown, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Viewer } from './StreamingRoom';

interface ViewerListProps {
  viewers: Viewer[];
}

export function ViewerList({ viewers }: ViewerListProps) {
  return (
    <div className="bg-card border border-border rounded-lg h-[300px] flex flex-col">
      {/* 시청자 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">시청자 ({viewers.length})</span>
        </div>
      </div>

      {/* 시청자 목록 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
        {viewers.map((viewer) => (
          <div key={viewer.id} className="flex items-center justify-between group hover:bg-muted/30 p-2 rounded">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={viewer.avatar} alt={viewer.username} />
                <AvatarFallback className="text-xs">
                  {viewer.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center space-x-1">
                <span className="text-sm truncate max-w-[80px]">
                  {viewer.username}
                </span>
                
                {viewer.username === 'streamerking' && (
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
                
                {viewer.isFollowing && (
                  <Star className="w-3 h-3 text-blue-500 fill-current" />
                )}
              </div>
            </div>

            {viewer.username !== 'streamerking' && (
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 h-auto"
              >
                @
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}