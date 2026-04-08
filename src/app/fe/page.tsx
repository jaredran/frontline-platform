'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getShiftsForEmployee, updateTaskStatus, getProfile, getPlaybookCompletions, getRelevantPlaybook } from '@/lib/data/store'
import { AIBriefing } from '@/components/shared/ai-briefing'
import { InlineAI } from '@/components/shared/inline-ai'

import { Loader2, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Task, TaskStatus, Shift, Profile, PlaybookCompletion, RelevantPlaybook } from '@/lib/types'

const STATUS_DOT: Record<TaskStatus, string> = {
  completed: 'bg-[#008a05]',
  in_progress: 'bg-[#ff385c]',
  pending: 'bg-[#ebebeb]',
  flagged: 'bg-[#c13515]',
}

const cardShadow = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px'

export default function MyShiftPage() {
  const { user } = useAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [handoffText, setHandoffText] = useState('')
  const [handoffLoading, setHandoffLoading] = useState(false)
  const [dismissedKnowledge, setDismissedKnowledge] = useState<Set<string>>(new Set())

  // Async data
  const [shifts, setShifts] = useState<Shift[]>([])
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [playbookCompletions, setPlaybookCompletions] = useState<PlaybookCompletion[]>([])
  const [relevantPlaybooks, setRelevantPlaybooks] = useState<Record<string, RelevantPlaybook | null>>({})
  const [dataLoaded, setDataLoaded] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user) return
    async function load() {
      const [shiftsData, profileData, completions] = await Promise.all([
        getShiftsForEmployee(user!.id, today),
        getProfile(user!.id),
        getPlaybookCompletions(undefined, user!.id),
      ])
      setShifts(shiftsData)
      setProfile(profileData)
      setPlaybookCompletions(completions)
      setDataLoaded(true)
    }
    load()
  }, [user, today])

  // Load relevant playbooks for each unique task category
  useEffect(() => {
    if (!user || !dataLoaded) return
    const currentShift = shifts.find(s => s.status === 'active') || shifts[0]
    const tasks: Task[] = currentShift?.tasks ?? []
    const categories = [...new Set(tasks.map(t => t.category))]
    Promise.all(
      categories.map(async (cat) => {
        const rp = await getRelevantPlaybook(cat, user!.id)
        return [cat, rp] as [string, RelevantPlaybook | null]
      })
    ).then(entries => setRelevantPlaybooks(Object.fromEntries(entries)))
  }, [user, shifts, dataLoaded])

  if (!user) return null
  if (!dataLoaded) {
    return (
      <div className="bg-white min-h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#ff385c]" />
      </div>
    )
  }

  const currentShift = shifts.find(s => s.status === 'active') || shifts[0]
  const tasks: Task[] = currentShift?.tasks ?? []
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.due_by) return 1
    if (!b.due_by) return -1
    return a.due_by.localeCompare(b.due_by)
  })

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length
  const allDone = totalCount > 0 && completedCount === totalCount
  const completionPct = totalCount > 0 ? completedCount / totalCount : 0

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  function handleToggle(taskId: string) {
    setExpandedId(prev => (prev === taskId ? null : taskId))
  }

  async function handleComplete(taskId: string) {
    setCompleting(taskId)
    const score = Math.floor(Math.random() * 15) + 85
    await updateTaskStatus(taskId, 'completed', score)
    // Refresh shifts
    const shiftsData = await getShiftsForEmployee(user!.id, today)
    setShifts(shiftsData)
    await new Promise(r => setTimeout(r, 300))
    setCompleting(null)
  }

  async function handleHandoff() {
    if (handoffLoading) return
    setHandoffLoading(true)
    setHandoffText('')
    try {
      const res = await fetch('/api/ai/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_name: profile?.full_name ?? 'Employee',
          shift_time: currentShift ? `${currentShift.start_time} - ${currentShift.end_time}` : '',
          tasks_summary: tasks.map(t => `${t.title}: ${t.status}${t.quality_score ? ` (${t.quality_score}%)` : ''}`).join('; '),
          location_name: currentShift?.location?.name ?? '',
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setHandoffText(accumulated)
      }
    } catch {
      setHandoffText('Unable to generate handoff. Please try again.')
    } finally {
      setHandoffLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-full">
        <AIBriefing
          role="fe"
          contextData={{
            employeeName: profile?.full_name,
            locationName: currentShift?.location?.name,
            todaysTasks: tasks.map(t => ({ title: t.title, category: t.category, status: t.status, qualityScore: t.quality_score })),
            skills: profile?.skills,
            playbookGaps: playbookCompletions.filter(c => c.score < 80).map(c => ({ playbook: c.playbook?.title, score: c.score })),
          }}
          accentColor="#ff385c"
        />
        {/* Shift header */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[#222222]">{todayFormatted}</p>
            {currentShift && (
              <p className="text-[13px] text-[#6a6a6a] mt-0.5">
                {currentShift.start_time} &ndash; {currentShift.end_time}
              </p>
            )}
          </div>
          <p className="text-[13px] text-[#6a6a6a]">
            <span className={`font-semibold ${allDone ? 'text-[#008a05]' : 'text-[#ff385c]'}`}>
              {completedCount}
            </span>
            {' '}of{' '}
            <span className={`font-semibold ${allDone ? 'text-[#008a05]' : 'text-[#ff385c]'}`}>
              {totalCount}
            </span>
            {' '}tasks done
          </p>
        </div>

        {/* Task feed */}
        {sortedTasks.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[#6a6a6a]">
            No tasks assigned for this shift.
          </div>
        ) : (
          <div>
            {sortedTasks.map(task => {
              const isExpanded = expandedId === task.id
              const isCompleting = completing === task.id
              const isDone = task.status === 'completed'
              const relevant = relevantPlaybooks[task.category]

              return (
                <div key={task.id}>
                  {/* Task row */}
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="w-full text-left py-4 px-5 border-b border-[#ebebeb] hover:bg-[#f7f7f7] transition-colors flex items-center gap-3"
                  >
                    {/* Status dot */}
                    <span className={`shrink-0 h-3 w-3 rounded-full ${STATUS_DOT[task.status]}`} />

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-semibold text-[#222222] ${isDone ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-[13px] text-[#6a6a6a] mt-0.5">{task.category}</p>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 text-right">
                      {task.due_by && (
                        <span className="text-[13px] text-[#6a6a6a]">{task.due_by}</span>
                      )}
                      {isDone && task.quality_score !== null && (
                        <p className="text-[13px] text-[#008a05] font-semibold mt-0.5">
                          {task.quality_score}%
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div
                      className="bg-[#f7f7f7] rounded-[20px] mx-5 my-2 p-5 space-y-4"
                      style={{ boxShadow: cardShadow }}
                    >
                      {relevant && relevant.needsReinforcement && !dismissedKnowledge.has(task.id) && (
                        <div className="mb-4 bg-[#fff8e1] border border-[#ffe082] rounded-[14px] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-[#c13515]" />
                              <span className="text-[13px] font-semibold text-[#222222]">Key procedure for this task</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDismissedKnowledge(prev => new Set(prev).add(task.id)) }}
                              className="text-[11px] text-[#6a6a6a] hover:text-[#222222] font-medium"
                            >
                              Hide
                            </button>
                          </div>
                          {relevant.playbook.content.steps.map((step, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                              <p className="text-[13px] font-semibold text-[#222222]">{i + 1}. {step.title}</p>
                              <p className="text-[12px] text-[#6a6a6a] mt-0.5">{step.instructions}</p>
                            </div>
                          ))}
                          {relevant.score !== null && (
                            <p className="text-[12px] text-[#c13515] font-medium mt-2">Your score: {relevant.score}% — practice makes perfect!</p>
                          )}
                        </div>
                      )}
                      {relevant && !relevant.needsReinforcement && (
                        <div className="mb-3 flex items-center gap-2 bg-[#e8f5e9] rounded-[14px] px-3 py-2">
                          <CheckCircle2 className="h-4 w-4 text-[#008a05]" />
                          <span className="text-[13px] font-medium text-[#008a05]">You&apos;ve mastered this — score: {relevant.score}%</span>
                        </div>
                      )}
                      {task.description && (
                        <p className="text-sm text-[#222222] leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {task.standard && (
                        <blockquote className="border-l-2 border-[#ff385c] pl-4">
                          <p className="text-[13px] text-[#6a6a6a] italic leading-relaxed">
                            {task.standard}
                          </p>
                        </blockquote>
                      )}

                      {!isDone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleComplete(task.id)
                          }}
                          disabled={isCompleting}
                          className="bg-[#222222] text-white rounded-[8px] px-6 py-2.5 font-medium text-sm hover:bg-[#ff385c] disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {isCompleting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            'Mark Complete'
                          )}
                        </button>
                      )}

                      <InlineAI
                        placeholder="Ask about this task..."
                        endpoint="/api/ai/task-help"
                        buildPayload={(message) => ({
                          message,
                          task_title: task.title,
                          task_description: task.description ?? '',
                          quality_standard: task.standard ?? '',
                          employee_name: profile?.full_name ?? '',
                        })}
                        compact
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Shift summary / handoff */}
        {completionPct > 0.6 && (
          <div
            className="bg-[#f7f7f7] rounded-[20px] mx-5 my-4 p-5 space-y-3"
            style={{ boxShadow: cardShadow }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#6a6a6a] font-semibold uppercase tracking-wider">
                Shift Summary
              </span>
              <span className="text-[13px] text-[#008a05] font-semibold">
                {Math.round(completionPct * 100)}% complete
              </span>
            </div>

            {!handoffText && (
              <button
                onClick={handleHandoff}
                disabled={handoffLoading}
                className="bg-[#ff385c] text-white rounded-[8px] px-6 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {handoffLoading ? 'Generating...' : 'Generate handoff'}
              </button>
            )}

            {(handoffText || handoffLoading) && (
              <div className="text-sm text-[#222222] leading-relaxed whitespace-pre-wrap bg-white rounded-[14px] p-4 border border-[#ebebeb]">
                {handoffText || (
                  <span className="text-[#6a6a6a] flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Generating handoff...
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
  )
}
