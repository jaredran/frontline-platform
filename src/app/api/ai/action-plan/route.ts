import { streamChat } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { diagnosis, approvedActions, locationName } = await req.json()

    const contextStr = `
Location: ${locationName}

Diagnosis:
${diagnosis}

Approved Actions:
${approvedActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}

Generate a detailed 4-week action plan to implement these approved actions.
`

    const stream = await streamChat(SYSTEM_PROMPTS.actionPlan, [
      { role: 'user', content: contextStr },
    ])

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Action plan API error:', error)
    return new Response('AI service unavailable.', { status: 500 })
  }
}
