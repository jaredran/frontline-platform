import { streamChat } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { topic, targetRole = 'fe', skillLevel = 'beginner' } = await req.json()

    const contextStr = `
Create micro-training content for this topic:

Topic: ${topic}
Target audience: ${targetRole === 'fe' ? 'Frontline QSR employees' : targetRole}
Skill level: ${skillLevel}

Generate the content as structured JSON with steps, quiz questions, and key takeaways.
`

    const stream = await streamChat(SYSTEM_PROMPTS.content, [
      { role: 'user', content: contextStr },
    ])

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Content API error:', error)
    return new Response('AI service unavailable.', { status: 500 })
  }
}
