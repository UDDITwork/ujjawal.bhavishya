'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import MentorChat from '@/components/mentorship/MentorChat'
import { useAuthStore } from '@/store/auth-store'

interface SessionInfo {
  id: string
  topic: string
  status: string
  mentor_name: string
  student_name: string
  preferred_date?: string | null
  preferred_time?: string | null
  mentor_note?: string | null
}

export default function StudentChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()
  const { user } = useAuthStore()
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/mentor-sessions/${sessionId}`)
        if (!res.ok) {
          setError('Session not found')
          return
        }
        const data = await res.json()
        setSession(data.session)
      } catch {
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500 mb-4">{error || 'Session not found'}</p>
          <Link
            href="/dashboard/mentorship"
            className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <ArrowLeft size={16} />
            Back to Mentorship
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-4">
        <Link
          href="/dashboard/mentorship"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to Mentorship
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{session.topic}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                with <span className="font-medium text-gray-700">{session.mentor_name}</span>
              </p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              session.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              session.status === 'requested' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              session.status === 'completed' ? 'bg-gray-100 text-gray-500 border-gray-200' :
              'bg-red-50 text-red-600 border-red-200'
            }`}>
              {session.status === 'accepted' ? 'Active' :
               session.status === 'requested' ? 'Pending' :
               session.status === 'completed' ? 'Completed' :
               'Declined'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat */}
      <MentorChat
        sessionId={sessionId}
        userType="student"
        currentUserId={user?.id || ''}
        currentUserName={user?.name || ''}
        sessionStatus={session.status}
        otherPartyName={session.mentor_name}
      />
    </div>
  )
}
