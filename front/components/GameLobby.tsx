import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface GameLobbyProps {
  user: any
  accessToken: string
  onJoinRoom: (room: any) => void
}

export function GameLobby({ user, accessToken, onJoinRoom }: GameLobbyProps) {
  const [loading, setLoading] = useState(false)

  const handleCreateRoom = () => {
    const mockRoom = {
      id: 'room-' + Date.now(),
      name: '테스트 방',
      host: user.id,
      players: [user.id],
      maxPlayers: 4,
      status: 'waiting',
      questions: [],
      scores: {}
    }
    onJoinRoom(mockRoom)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-2">게임 로비</h2>
        <p className="text-lg opacity-90">친구들과 함께 퀴즈에 도전하세요!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 게임 시작</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            방 만들기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}