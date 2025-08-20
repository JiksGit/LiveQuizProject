import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Trophy, Medal, Award, RefreshCw, Crown } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export function Rankings() {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRankings()
  }, [])

  const loadRankings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cfe6574f/rankings`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setRankings(data.rankings || [])
      }
    } catch (error) {
      console.error('Failed to load rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <Trophy className="w-6 h-6 text-gray-300" />
    }
  }

  const getRankBadgeVariant = (index: number) => {
    switch (index) {
      case 0:
        return "default"
      case 1:
        return "secondary"
      case 2:
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white">랭킹을 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-2">플레이어 랭킹</h2>
        <p className="text-lg opacity-90">최고의 퀴즈 마스터들을 확인하세요!</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                전체 랭킹
              </CardTitle>
              <CardDescription>
                총 점수 기준 상위 플레이어들
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadRankings} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">아직 랭킹이 없습니다</h3>
              <p className="text-gray-500">첫 번째 퀴즈 챔피언이 되어보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankings.slice(0, 3).map((player, index) => (
                <div key={player.id} className={`p-6 rounded-lg border-2 ${
                  index === 0 ? 'border-yellow-400 bg-yellow-50' :
                  index === 1 ? 'border-gray-400 bg-gray-50' :
                  'border-amber-400 bg-amber-50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(index)}
                      <Badge variant={getRankBadgeVariant(index)} className="text-lg px-3 py-1">
                        {index + 1}위
                      </Badge>
                    </div>
                    
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-lg">
                        {player.name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{player.name}</h3>
                      <p className="text-sm text-gray-600">
                        {player.gamesPlayed}게임 플레이 • 평균 {(player.totalScore / Math.max(player.gamesPlayed, 1)).toFixed(1)}점
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {player.totalScore}점
                      </div>
                      <div className="text-sm text-gray-500">
                        레벨 {Math.floor(player.totalScore / 100)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {rankings.length > 3 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-600 mt-6 mb-3">기타 순위</h4>
                  {rankings.slice(3).map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {index + 4}위
                        </Badge>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {player.name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            {player.gamesPlayed}게임
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{player.totalScore}점</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통계 카드들 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">총 플레이어</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {rankings.length}
            </div>
            <p className="text-sm text-gray-500">등록된 플레이어</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">최고 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {rankings.length > 0 ? rankings[0].totalScore : 0}
            </div>
            <p className="text-sm text-gray-500">
              {rankings.length > 0 ? rankings[0].name : '기록 없음'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">평균 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {rankings.length > 0 
                ? Math.round(rankings.reduce((sum, p) => sum + p.totalScore, 0) / rankings.length)
                : 0
              }
            </div>
            <p className="text-sm text-gray-500">전체 평균</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}