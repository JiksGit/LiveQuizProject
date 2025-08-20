import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Button } from './ui/button';

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video group">
      {/* 비디오 플레이스홀더 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-12 h-12" />
            </div>
            <p className="text-lg opacity-80">라이브 스트림</p>
            <div className="flex items-center justify-center mt-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 비디오 컨트롤 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 p-2"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 p-2"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none slider"
                style={{
                  background: `linear-gradient(to right, #ffffff ${isMuted ? 0 : volume}%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume}%)`
                }}
              />
            </div>

            <span className="text-sm opacity-80">1:23:45</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full h-1 bg-white/30 rounded-full mt-3 cursor-pointer">
          <div 
            className="h-full bg-red-500 rounded-full relative"
            style={{ width: '0%' }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 라이브 표시 */}
      <div className="absolute top-4 left-4">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
          LIVE
        </div>
      </div>

      {/* 시청자 수 */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          1,247 시청자
        </div>
      </div>
    </div>
  );
}