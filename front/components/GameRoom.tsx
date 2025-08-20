import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ArrowLeft } from 'lucide-react'

interface GameRoomProps {
  room: any
  user: any
  accessToken: string
  onLeaveRoom: () => void
}

export function GameRoom({ room, user, accessToken, onLeaveRoom }: GameRoomProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onLeaveRoom} 
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            로비로 돌아가기
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{room.name}</h2>
            <p className="opacity-75">방 ID: {room.id}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          대기 중
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>게임 대기실</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg mb-4">게임 기능을 준비 중입니다...</p>
            <p className="text-sm text-gray-500">
              참가자: {room.players?.length || 0}/{room.maxPlayers || 4}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}