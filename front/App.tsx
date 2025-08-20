import React, { useState, useEffect } from 'react'
import AuthForm from './components/AuthForm'
import { QuizLobby } from './components/QuizLobby'
import { QuizRoom } from './components/QuizRoom'
import { Profile } from './components/Profile'
import { Rankings } from './components/Rankings'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Trophy, Settings, LogOut } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { Toaster } from './components/ui/sonner'

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

export default function App() {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [currentView, setCurrentView] = useState('lobby')
  const [currentRoom, setCurrentRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        setAccessToken(session.access_token)
      }
    } catch (error) {
      console.error('Error checking user session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: any, token: string) => {
    setUser(userData)
    setAccessToken(token)
    setCurrentView('lobby')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAccessToken(null)
      setCurrentView('lobby')
      setCurrentRoom(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const joinRoom = (room: any) => {
    setCurrentRoom(room)
    setCurrentView('game')
  }

  const leaveRoom = () => {
    setCurrentRoom(null)
    setCurrentView('lobby')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white">로딩 중...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthForm onAuthSuccess={handleLogin} />
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {/* 헤더 */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🧠 실시간 퀴즈 게임</h1>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('lobby')}
              className="text-white hover:bg-white/20"
            >
              로비
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('profile')}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              프로필
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('rankings')}
              className="text-white hover:bg-white/20"
            >
              <Trophy className="w-4 h-4 mr-2" />
              랭킹
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'lobby' && (
          <QuizLobby 
            user={user} 
            accessToken={accessToken} 
            onJoinRoom={joinRoom}
          />
        )}
        
        {currentView === 'game' && currentRoom && (
          <QuizRoom 
            room={currentRoom}
            user={user}
            accessToken={accessToken}
            onLeaveRoom={leaveRoom}
          />
        )}
        
        {currentView === 'profile' && (
          <Profile 
            user={user}
            accessToken={accessToken}
          />
        )}
        
        {currentView === 'rankings' && (
          <Rankings />
        )}
      </main>
      <Toaster />
    </div>
  )
}