'use client'

import { Clock, MessageSquare, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface MentorshipSession {
  id: string
  topic: string
  status: string
  student_name: string
  mentor_name: string
  preferred_date?: string | null
  preferred_time?: string | null
  created_at: string
  updated_at: string
  unread_count: number
}

interface MentorshipSessionCardProps {
  session: MentorshipSession
  viewAs: 'student' | 'mentor'
  onClick?: () => void
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  requested: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  accepted: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: MessageSquare },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: CheckCircle2 },
  rejected: { label: 'Declined', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
}

export default function MentorshipSessionCard({ session, viewAs, onClick }: MentorshipSessionCardProps) {
  const config = statusConfig[session.status] || { label: session.status, color: 'bg-gray-100 text-gray-500 border-gray-200', icon: AlertCircle }
  const StatusIcon = config.icon
  const otherName = viewAs === 'student' ? session.mentor_name : session.student_name

  const date = (() => {
    try {
      return new Date(session.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short',
      })
    } catch { return '' }
  })()

  return (
    <div
      onClick={onClick}
      className="min-w-[220px] rounded-xl bg-white border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer shrink-0"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">{session.topic}</h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${config.color}`}>
          <StatusIcon size={10} className="inline -mt-0.5 mr-0.5" />
          {config.label}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        {viewAs === 'student' ? 'Mentor' : 'Student'}: <span className="font-medium text-gray-700">{otherName}</span>
      </p>

      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {date}
        </span>
        {session.preferred_date && (
          <span className="text-gray-300">
            Pref: {session.preferred_date}
          </span>
        )}
      </div>

      {session.unread_count > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <MessageSquare size={10} />
            {session.unread_count} new
          </span>
        </div>
      )}
    </div>
  )
}
