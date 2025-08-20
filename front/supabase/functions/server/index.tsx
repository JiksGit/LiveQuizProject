import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// 사용자 회원가입
app.post('/make-server-cfe6574f/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // 이메일 서버가 구성되지 않았으므로 자동으로 이메일 확인
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // 사용자 프로필 생성
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      totalScore: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString()
    })

    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup server error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 게임 방 생성
app.post('/make-server-cfe6574f/rooms/create', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { roomName, maxPlayers = 4 } = await c.req.json()
    const roomId = `room:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const room = {
      id: roomId,
      name: roomName,
      host: user.id,
      players: [user.id],
      maxPlayers,
      status: 'waiting', // waiting, playing, finished
      currentQuestion: 0,
      questions: generateQuestions(),
      scores: { [user.id]: 0 },
      createdAt: new Date().toISOString()
    }

    await kv.set(roomId, room)
    
    return c.json({ room })
  } catch (error) {
    console.log('Room creation error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 게임 방 참가
app.post('/make-server-cfe6574f/rooms/:roomId/join', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const roomId = c.req.param('roomId')
    const room = await kv.get(roomId)
    
    if (!room) {
      return c.json({ error: 'Room not found' }, 404)
    }

    if (room.players.length >= room.maxPlayers) {
      return c.json({ error: 'Room is full' }, 400)
    }

    if (room.status !== 'waiting') {
      return c.json({ error: 'Game already started' }, 400)
    }

    if (!room.players.includes(user.id)) {
      room.players.push(user.id)
      room.scores[user.id] = 0
    }

    await kv.set(roomId, room)
    
    return c.json({ room })
  } catch (error) {
    console.log('Room join error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 게임 시작
app.post('/make-server-cfe6574f/rooms/:roomId/start', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const roomId = c.req.param('roomId')
    const room = await kv.get(roomId)
    
    if (!room) {
      return c.json({ error: 'Room not found' }, 404)
    }

    if (room.host !== user.id) {
      return c.json({ error: 'Only host can start the game' }, 403)
    }

    room.status = 'playing'
    room.currentQuestion = 0
    room.startedAt = new Date().toISOString()

    await kv.set(roomId, room)
    
    return c.json({ room })
  } catch (error) {
    console.log('Game start error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 답변 제출
app.post('/make-server-cfe6574f/rooms/:roomId/answer', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const roomId = c.req.param('roomId')
    const { answer } = await c.req.json()
    const room = await kv.get(roomId)
    
    if (!room) {
      return c.json({ error: 'Room not found' }, 404)
    }

    if (room.status !== 'playing') {
      return c.json({ error: 'Game not in progress' }, 400)
    }

    const currentQ = room.questions[room.currentQuestion]
    if (currentQ && answer === currentQ.correct) {
      room.scores[user.id] = (room.scores[user.id] || 0) + 10
    }

    await kv.set(roomId, room)
    
    return c.json({ correct: answer === currentQ?.correct, score: room.scores[user.id] })
  } catch (error) {
    console.log('Answer submission error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 다음 질문으로 넘어가기
app.post('/make-server-cfe6574f/rooms/:roomId/next', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const roomId = c.req.param('roomId')
    const room = await kv.get(roomId)
    
    if (!room || room.host !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    room.currentQuestion++
    if (room.currentQuestion >= room.questions.length) {
      room.status = 'finished'
      // 게임 기록 저장
      for (const playerId of room.players) {
        const userProfile = await kv.get(`user:${playerId}`)
        if (userProfile) {
          userProfile.totalScore += room.scores[playerId] || 0
          userProfile.gamesPlayed++
          await kv.set(`user:${playerId}`, userProfile)
        }
      }
    }

    await kv.set(roomId, room)
    
    return c.json({ room })
  } catch (error) {
    console.log('Next question error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 게임 방 정보 조회
app.get('/make-server-cfe6574f/rooms/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const room = await kv.get(roomId)
    
    if (!room) {
      return c.json({ error: 'Room not found' }, 404)
    }
    
    return c.json({ room })
  } catch (error) {
    console.log('Room fetch error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 채팅 메시지 전송
app.post('/make-server-cfe6574f/rooms/:roomId/chat', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const roomId = c.req.param('roomId')
    const { message } = await c.req.json()
    
    const chatKey = `chat:${roomId}`
    const existingChats = await kv.get(chatKey) || []
    
    const newMessage = {
      id: Date.now(),
      userId: user.id,
      message,
      timestamp: new Date().toISOString()
    }
    
    existingChats.push(newMessage)
    // 최근 100개 메시지만 유지
    if (existingChats.length > 100) {
      existingChats.splice(0, existingChats.length - 100)
    }
    
    await kv.set(chatKey, existingChats)
    
    return c.json({ message: newMessage })
  } catch (error) {
    console.log('Chat message error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 채팅 메시지 조회
app.get('/make-server-cfe6574f/rooms/:roomId/chat', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const chatKey = `chat:${roomId}`
    const messages = await kv.get(chatKey) || []
    
    return c.json({ messages })
  } catch (error) {
    console.log('Chat fetch error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 사용자 프로필 조회
app.get('/make-server-cfe6574f/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await kv.get(`user:${user.id}`)
    return c.json({ profile })
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 랭킹 조회
app.get('/make-server-cfe6574f/rankings', async (c) => {
  try {
    const users = await kv.getByPrefix('user:')
    const rankings = users
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, 10)
    
    return c.json({ rankings })
  } catch (error) {
    console.log('Rankings fetch error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 퀴즈 질문 생성 함수
function generateQuestions() {
  const questions = [
    {
      question: "대한민국의 수도는 어디인가요?",
      options: ["서울", "부산", "대구", "인천"],
      correct: "서울"
    },
    {
      question: "2 + 2는 얼마인가요?",
      options: ["3", "4", "5", "6"],
      correct: "4"
    },
    {
      question: "지구에서 가장 큰 대양은?",
      options: ["대서양", "인도양", "태평양", "북극해"],
      correct: "태평양"
    },
    {
      question: "컴퓨터의 두뇌 역할을 하는 부품은?",
      options: ["RAM", "CPU", "GPU", "SSD"],
      correct: "CPU"
    },
    {
      question: "1년은 몇 일인가요?",
      options: ["364일", "365일", "366일", "367일"],
      correct: "365일"
    }
  ]
  
  return questions.sort(() => Math.random() - 0.5)
}

Deno.serve(app.fetch)