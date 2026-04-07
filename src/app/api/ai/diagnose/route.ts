import { streamChat } from '@/lib/ai/client'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'
import { getPulseMetrics, getTasksByLocation, getProfilesByLocation, getPlaybookCompletions } from '@/lib/data/store'

export async function POST(req: NextRequest) {
  try {
    const { metricName, actual, target, locationId, locationName } = await req.json()

    // Gather context data
    const allMetrics = getPulseMetrics(locationId)
    const locationTasks = getTasksByLocation(locationId)
    const employees = getProfilesByLocation(locationId).filter(p => p.role === 'fe')
    const completions = employees.flatMap(e => getPlaybookCompletions(undefined, e.id))

    const completedTasks = locationTasks.filter(t => t.status === 'completed')
    const avgQuality = completedTasks.length > 0
      ? Math.round(completedTasks.reduce((sum, t) => sum + (t.quality_score || 0), 0) / completedTasks.length)
      : 0

    const contextData = `
Location: ${locationName} (${locationId})
Metric Under Analysis: ${metricName} — Actual: ${actual}, Target: ${target}

All Pulse Metrics:
${allMetrics.map(m => `- ${m.metric_name}: ${m.actual} / ${m.target} (trend: ${m.trend})`).join('\n')}

Employees (${employees.length}):
${employees.map(e => `- ${e.full_name}: hired ${e.hire_date}, skills: ${e.skills.map(s => `${s.name}(${s.level})`).join(', ')}`).join('\n')}

Task Performance:
- Total tasks today: ${locationTasks.length}
- Completed: ${completedTasks.length}
- Flagged: ${locationTasks.filter(t => t.status === 'flagged').length}
- Average quality score: ${avgQuality}%
${locationTasks.filter(t => t.quality_score !== null && t.quality_score < 70).map(t => `- LOW QUALITY: "${t.title}" scored ${t.quality_score}% (assigned to ${t.assignee?.full_name || 'unassigned'})`).join('\n')}

Training Completions:
${employees.map(e => {
  const empCompletions = completions.filter(c => c.profile_id === e.id)
  return `- ${e.full_name}: ${empCompletions.length} playbooks completed, avg score: ${empCompletions.length > 0 ? Math.round(empCompletions.reduce((s, c) => s + c.score, 0) / empCompletions.length) : 'N/A'}`
}).join('\n')}
`

    const messages = [
      { role: 'user' as const, content: `Diagnose this underperforming metric:\n${contextData}` },
    ]

    const stream = await streamChat(SYSTEM_PROMPTS.diagnose, messages)

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Diagnose API error:', error)
    return new Response('AI service unavailable. Check ANTHROPIC_API_KEY.', { status: 500 })
  }
}
