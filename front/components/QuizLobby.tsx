import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Plus, Users, Play, RefreshCw } from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface QuizLobbyProps {
  user: any
  accessToken: string
  onJoinRoom: (room: any) => void
}

export function QuizLobby({ user, accessToken, onJoinRoom }: QuizLobbyProps) {
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    setRooms([])
  }

  const createRoom = async () => {
    if (!roomName.trim()) {
      setError('방 이름을 입력해주세요')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ roomName, maxPlayers }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '방 생성에 실패했습니다')
      }

      setCreateDialogOpen(false)
      setRoomName('')
      onJoinRoom(data.room)
    } catch (err: any) {
      console.error('Room creation error:', err)
      setError(err.message || '방 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async (roomId: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '방 참가에 실패했습니다')
      }

      onJoinRoom(data.room)
    } catch (err: any) {
      console.error('Room join error:', err)
      setError(err.message || '방 참가 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-2">게임 로비</h2>
        <p className="text-lg opacity-90">친구들과 함께 퀴즈에 도전하세요!</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              새 게임 시작
            </CardTitle>
            <CardDescription>
              새로운 퀴즈 방을 만들어 친구들을 초대하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  방 만들기
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 게임 방 만들기</DialogTitle>
                  <DialogDescription>
                    방 이름과 최대 플레이어 수를 설정하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">방 이름</Label>
                    <Input
                      id="roomName"
                      placeholder="방 이름을 입력하세요"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers">최대 플레이어 수</Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      min="2"
                      max="8"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={createRoom}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? '생성 중...' : '방 만들기'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              빠른 게임
            </CardTitle>
            <CardDescription>
              즉시 다른 플레이어들과 매칭되어 게임을 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              빠른 매칭 (준비 중)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                활성 게임 방
              </CardTitle>
              <CardDescription>
                현재 진행 중인 게임 방들에 참가할 수 있습니다
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadRooms}>
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>현재 활성화된 게임 방이 없습니다.</p>
              <p className="text-sm">새로운 방을 만들어 게임을 시작해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-gray-500">
                      {room.players.length}/{room.maxPlayers} 플레이어
                    </p>
                  </div>
                  <Button
                    onClick={() => joinRoom(room.id)}
                    disabled={loading || room.players.length >= room.maxPlayers}
                  >
                    참가하기
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}