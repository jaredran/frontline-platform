import { streamChat } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { role, contextData } = await req.json()

    const userMessage = `Generate a proactive briefing for this ${role} user.\n\nContext data:\n${JSON.stringify(contextData, null, 2)}`

    const stream = await streamChat(SYSTEM_PROMPTS.briefing, [
      { role: 'user', content: userMessage },
    ])

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Briefing API error:', error)
    return new Response('AI briefing unavailable.', { status: 500 })
  }
}
