'use client'

import { Clock, Calendar, MessageSquare, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface SessionCardSession {
  id: string
  topic: string
  status: string
  student_name: string
  mentor_name: string
  unread_count: number
  created_at: string
  updated_at: string
  preferred_date: string | null
  preferred_time: string | null
  mentor_note: string | null
}

interface SessionCardProps {
  session: SessionCardSession
  viewAs: 'student' | 'mentor'
  onClick: () => void
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatPreferredDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPreferredTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${String(minutes).padStart(2, '0')} ${period}`
}

const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  requested: {
    label: 'Requested',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: <AlertCircle size={11} />,
  },
  accepted: {
    label: 'Active',
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: <CheckCircle2 size={11} />,
  },
  rejected: {
    label: 'Declined',
    classes: 'bg-red-50 text-red-600 border border-red-200',
    icon: <XCircle size={11} />,
  },
  completed: {
    label: 'Completed',
    classes: 'bg-gray-100 text-gray-500 border border-gray-200',
    icon: <CheckCircle2 size={11} />,
  },
}

export default function SessionCard({ session, viewAs, onClick }: SessionCardProps) {
  const otherName = viewAs === 'student' ? session.mentor_name : session.student_name
  const status = statusConfig[session.status] || statusConfig.requested

  return (
    <div
      onClick={onClick}
      className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Top row: topic + status badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{session.topic}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {viewAs === 'student' ? 'Mentor' : 'Student'}: {otherName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {session.unread_count > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {session.unread_count > 9 ? '9+' : session.unread_count}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.classes}`}
          >
            {status.icon}
            {status.label}
          </span>
        </div>
      </div>

      {/* Preferred date/time & last activity */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        {session.preferred_date && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatPreferredDate(session.preferred_date)}
          </span>
        )}
        {session.preferred_time && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatPreferredTime(session.preferred_time)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <MessageSquare size={12} />
          {relativeTime(session.updated_at)}
        </span>
      </div>

      {/* Mentor note for rejected sessions */}
      {session.status === 'rejected' && session.mentor_note && (
        <p className="mt-2 text-xs text-red-500 italic line-clamp-2">
          &ldquo;{session.mentor_note}&rdquo;
        </p>
      )}
    </div>
  )
}
