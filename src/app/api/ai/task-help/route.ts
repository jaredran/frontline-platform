import { streamChat } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { taskTitle, taskDescription, taskStandard, employeeName, skillLevel } = await req.json()

    const contextStr = `
An employee needs help with this task:

Task: ${taskTitle}
Description: ${taskDescription || 'Not specified'}
Standard: ${taskStandard || 'Not specified'}
Employee: ${employeeName || 'Team member'}
Skill level: ${skillLevel || 'new'}

Provide brief, encouraging step-by-step help.
`

    const stream = await streamChat(SYSTEM_PROMPTS.taskHelp, [
      { role: 'user', content: contextStr },
    ])

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Task help API error:', error)
    return new Response('AI service unavailable.', { status: 500 })
  }
}
