'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getShiftsForEmployee, updateTaskStatus, getProfile } from '@/lib/data/store'
import { InlineAI } from '@/components/shared/inline-ai'
import { RoleShell } from '@/components/shared/role-shell'
import { Loader2, FileText } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'

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
  const [, setTick] = useState(0)
  const [handoffText, setHandoffText] = useState('')
  const [handoffLoading, setHandoffLoading] = useState(false)

  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const shifts = getShiftsForEmployee(user.id, today)
  const currentShift = shifts.find(s => s.status === 'active') || shifts[0]
  const profile = getProfile(user.id)

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
    updateTaskStatus(taskId, 'completed', score)
    await new Promise(r => setTimeout(r, 300))
    setCompleting(null)
    setTick(t => t + 1)
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
    <RoleShell role="fe">
      <div className="bg-white min-h-full">
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
    </RoleShell>
  )
}
