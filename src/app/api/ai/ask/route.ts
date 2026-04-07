import { streamChat } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context, history = [] } = await req.json()

    const contextStr = [
      `User role: ${context.role}`,
      context.userName && `User name: ${context.userName}`,
      context.locationId && `Location ID: ${context.locationId}`,
    ].filter(Boolean).join('\n')

    const systemPrompt = `${SYSTEM_PROMPTS.ask}\n\nCurrent context:\n${contextStr}`

    const messages = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const stream = await streamChat(systemPrompt, messages)

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Ask API error:', error)
    return new Response('AI service unavailable. Check ANTHROPIC_API_KEY.', { status: 500 })
  }
}
