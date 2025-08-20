import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Trophy, Games, Target, Calendar, RefreshCw } from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface ProfileProps {
  user: any
  accessToken: string
}

export function Profile({ user, accessToken }: ProfileProps) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>프로필을 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p>프로필을 불러올 수 없습니다.</p>
            <Button onClick={loadProfile} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const averageScore = profile.gamesPlayed > 0 ? (profile.totalScore / profile.gamesPlayed).toFixed(1) : '0.0'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-2">내 프로필</h2>
        <p className="text-lg opacity-90">게임 통계와 성과를 확인하세요</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 프로필 정보 */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>가입일: {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 게임 통계 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              게임 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {profile.totalScore}
                </div>
                <div className="text-sm text-gray-500">총 점수</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {profile.gamesPlayed}
                </div>
                <div className="text-sm text-gray-500">게임 수</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {averageScore}
                </div>
                <div className="text-sm text-gray-500">평균 점수</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {Math.floor(profile.totalScore / 100)}
                </div>
                <div className="text-sm text-gray-500">레벨</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 성취 시스템 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            성취 목표
          </CardTitle>
          <CardDescription>
            다양한 성취를 달성하여 보상을 받으세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">첫 게임</h3>
                <Badge variant={profile.gamesPlayed >= 1 ? "default" : "secondary"}>
                  {profile.gamesPlayed >= 1 ? "완료" : "진행 중"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-2">첫 퀴즈 게임 완료하기</p>
              <div className="text-xs text-gray-400">
                진행률: {Math.min(profile.gamesPlayed, 1)}/1
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">퀴즈 마스터</h3>
                <Badge variant={profile.gamesPlayed >= 10 ? "default" : "secondary"}>
                  {profile.gamesPlayed >= 10 ? "완료" : "진행 중"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-2">10게임 완료하기</p>
              <div className="text-xs text-gray-400">
                진행률: {Math.min(profile.gamesPlayed, 10)}/10
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">점수 수집가</h3>
                <Badge variant={profile.totalScore >= 500 ? "default" : "secondary"}>
                  {profile.totalScore >= 500 ? "완료" : "진행 중"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-2">총 500점 달성하기</p>
              <div className="text-xs text-gray-400">
                진행률: {Math.min(profile.totalScore, 500)}/500
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}