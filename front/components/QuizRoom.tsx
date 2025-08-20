import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { ArrowLeft, Send, Trophy, Users, MessageCircle, Play, SkipForward } from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface QuizRoomProps {
  room: any
  user: any
  accessToken: string
  onLeaveRoom: () => void
}

interface ChatMessage {
  id: number
  userId: string
  message: string
  timestamp: string
}

export function QuizRoom({ room: initialRoom, user, accessToken, onLeaveRoom }: QuizRoomProps) {
  const [room, setRoom] = useState(initialRoom)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatMessages()
    loadUserProfiles()
    
    const interval = setInterval(updateRoomState, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (room.status === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [room.status])

  const loadChatMessages = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/${room.id}/chat`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error)
    }
  }

  const loadUserProfiles = async () => {
    const profiles: Record<string, any> = {}
    for (const playerId of room.players) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/profile`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.profile && data.profile.id === playerId) {
            profiles[playerId] = data.profile
          }
        }
      } catch (error) {
        console.error(`Failed to load profile for ${playerId}:`, error)
      }
    }
    setUserProfiles(profiles)
  }

  const updateRoomState = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/${room.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setRoom(data.room)
      }
    } catch (error) {
      console.error('Failed to update room state:', error)
    }
  }

  const startGame = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/${room.id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error)
      }

      setRoom(data.room)
      setTimeLeft(30)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!selectedAnswer) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/${room.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ answer: selectedAnswer }),
      })

      const data = await response.json()
      if (response.ok) {
        setSelectedAnswer('')
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const nextQuestion = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/${room.id}/next`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setRoom(data.room)
        setTimeLeft(30)
        setSelectedAnswer('')
      }
    } catch (error) {
      console.error('Failed to go to next question:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rooms/${room.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: chatMessage }),
      })

      if (response.ok) {
        setChatMessage('')
        loadChatMessages()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const currentQuestion = room.questions?.[room.currentQuestion]
  const isHost = room.host === user.id

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onLeaveRoom} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            로비로 돌아가기
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{room.name}</h2>
            <p className="opacity-75">방 ID: {room.id}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {room.status === 'waiting' && '대기 중'}
          {room.status === 'playing' && '게임 진행 중'}
          {room.status === 'finished' && '게임 완료'}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {room.status === 'waiting' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  플레이어 대기 중...
                </CardTitle>
                <CardDescription>
                  모든 플레이어가 준비되면 게임을 시작할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>참가자: {room.players?.length || 0}/{room.maxPlayers}</span>
                    {isHost && (
                      <Button onClick={startGame} disabled={loading || (room.players?.length || 0) < 2}>
                        <Play className="w-4 h-4 mr-2" />
                        게임 시작
                      </Button>
                    )}
                  </div>
                  {!isHost && (
                    <p className="text-sm text-gray-500">방장이 게임을 시작하기를 기다리고 있습니다...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {room.status === 'playing' && currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    질문 {room.currentQuestion + 1} / {room.questions?.length || 0}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{timeLeft}초</div>
                    <Progress value={(timeLeft / 30) * 100} className="w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-xl font-medium">
                  {currentQuestion.question}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options?.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? "default" : "outline"}
                      className="h-16 text-left justify-start"
                      onClick={() => setSelectedAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!selectedAnswer}
                    className="flex-1"
                  >
                    답변 제출
                  </Button>
                  {isHost && (
                    <Button variant="outline" onClick={nextQuestion}>
                      <SkipForward className="w-4 h-4 mr-2" />
                      다음 질문
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {room.status === 'finished' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  게임 완료!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">최종 점수</h3>
                  <div className="space-y-2">
                    {Object.entries(room.scores || {})
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .map(([playerId, score], index) => (
                        <div key={playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              {index + 1}위
                            </Badge>
                            <span>{userProfiles[playerId]?.name || playerId}</span>
                          </div>
                          <span className="font-bold">{score}점</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                플레이어 ({room.players?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {room.players?.map((playerId: string) => (
                  <div key={playerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                        {userProfiles[playerId]?.name?.[0] || '?'}
                      </div>
                      <span className="text-sm">
                        {userProfiles[playerId]?.name || playerId}
                        {playerId === room.host && ' (방장)'}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {room.scores?.[playerId] || 0}점
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                채팅
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-purple-600">
                          {userProfiles[msg.userId]?.name || '알 수 없음'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <Separator />
              <form onSubmit={sendMessage} className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="메시지를 입력하세요..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}