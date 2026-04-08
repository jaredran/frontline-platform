import { generateJSON } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { locationName, locationType, teamSize, challenges } = await req.json()

    const userMessage = `Set up a new location based on this information:

Location name: ${locationName || 'My Location'}
Type: ${locationType || 'Quick Service'}
Team size: ${teamSize || '10-20'}
What's not working right now: ${challenges || 'General performance issues'}

Diagnose their situation and generate the full location setup.`

    const result = await generateJSON(SYSTEM_PROMPTS.setup, userMessage)

    // Try to parse JSON from the response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse setup' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Setup API error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}
