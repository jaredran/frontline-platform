import { streamChat } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { shiftData } = await req.json()

    const contextStr = `
Shift: ${shiftData.date} ${shiftData.startTime} - ${shiftData.endTime}
Location: ${shiftData.locationName}

Tasks completed:
${shiftData.completedTasks?.map((t: { title: string; qualityScore: number }) => `- ${t.title} (quality: ${t.qualityScore}%)`).join('\n') || 'None'}

Tasks remaining:
${shiftData.remainingTasks?.map((t: { title: string; status: string }) => `- ${t.title} (${t.status})`).join('\n') || 'None'}

Flagged issues:
${shiftData.flaggedTasks?.map((t: { title: string; issue: string }) => `- ${t.title}: ${t.issue}`).join('\n') || 'None'}

Notes: ${shiftData.notes || 'None'}
`

    const stream = await streamChat(SYSTEM_PROMPTS.handoff, [
      { role: 'user', content: `Generate a shift handoff summary:\n${contextStr}` },
    ])

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Handoff API error:', error)
    return new Response('AI service unavailable.', { status: 500 })
  }
}
