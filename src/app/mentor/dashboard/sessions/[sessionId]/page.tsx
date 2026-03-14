'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Calendar, Clock } from 'lucide-react'
import MentorChat from '@/components/mentorship/MentorChat'
import toast from 'react-hot-toast'

interface SessionInfo {
  id: string
  topic: string
  status: string
  student_name: string
  mentor_name: string
  student_message?: string | null
  preferred_date?: string | null
  preferred_time?: string | null
  mentor_note?: string | null
  created_at: string
}

interface MentorInfo {
  _id: string
  name: string
}

export default function MentorChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [mentor, setMentor] = useState<MentorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responding, setResponding] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/mentor/sessions/${sessionId}`)
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

  const fetchMentor = async () => {
    try {
      const res = await fetch('/api/mentor/me')
      if (!res.ok) return
      const data = await res.json()
      setMentor(data.mentor)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchSession()
    fetchMentor()
  }, [sessionId])

  const handleRespond = async (action: 'accept' | 'reject') => {
    setResponding(true)
    try {
      const body: Record<string, string> = { action }
      if (action === 'reject' && rejectNote.trim()) {
        body.mentor_note = rejectNote.trim()
      }

      const res = await fetch(`/api/mentor/sessions/${sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to respond')
      }

      toast.success(action === 'accept' ? 'Session accepted!' : 'Session declined.')
      setShowRejectForm(false)
      setRejectNote('')
      // Refetch session to update status
      setLoading(true)
      await fetchSession()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500 mb-4">{error || 'Session not found'}</p>
          <Link
            href="/mentor/dashboard/sessions"
            className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <ArrowLeft size={16} />
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Back link */}
      <Link
        href="/mentor/dashboard/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Sessions
      </Link>

      {/* Session header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-900">{session.topic}</h1>
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

        <p className="text-sm text-gray-500">
          Student: <span className="font-medium text-gray-700">{session.student_name}</span>
        </p>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          {session.preferred_date && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {session.preferred_date}
            </span>
          )}
          {session.preferred_time && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {session.preferred_time}
            </span>
          )}
        </div>

        {session.student_message && (
          <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-[11px] font-medium text-gray-400 mb-0.5">Student&apos;s message:</p>
            <p className="text-sm text-gray-600">{session.student_message}</p>
          </div>
        )}
      </div>

      {/* Accept/Reject controls for pending sessions */}
      {session.status === 'requested' && (
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Respond to this request:</p>

          {showRejectForm ? (
            <div className="space-y-3">
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Reason for declining (optional)..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRespond('reject')}
                  disabled={responding}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {responding ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Confirm Decline
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setRejectNote('') }}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRespond('accept')}
                disabled={responding}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors"
              >
                {responding ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Accept
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={responding}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle size={14} />
                Decline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white" style={{ height: 'calc(100vh - 400px)', minHeight: '350px' }}>
        <MentorChat
          sessionId={sessionId}
          userType="mentor"
          currentUserId={mentor?._id || ''}
          currentUserName={mentor?.name || ''}
          sessionStatus={session.status}
          otherPartyName={session.student_name}
        />
      </div>
    </div>
  )
}
