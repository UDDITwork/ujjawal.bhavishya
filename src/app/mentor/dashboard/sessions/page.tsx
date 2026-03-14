'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Inbox, Clock, MessageSquare, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'
import MentorshipSessionCard from '@/components/mentorship/MentorshipSessionCard'

interface MentorSession {
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

export default function MentorSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<MentorSession[]>([])
  const [loading, setLoading] = useState(true)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/mentor/sessions/inbox')
      if (!res.ok) return
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  // 15-second polling, pause when tab hidden
  useEffect(() => {
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchSessions()
        }
      }, 15000)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchSessions()
        startPolling()
      } else {
        if (pollingRef.current) clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const pending = sessions.filter(s => s.status === 'requested')
  const active = sessions.filter(s => s.status === 'accepted')
  const completed = sessions.filter(s => s.status === 'completed')
  const declined = sessions.filter(s => s.status === 'rejected')

  const sections = [
    { title: 'Pending Requests', items: pending, icon: Clock, color: 'text-amber-600', emptyText: 'No pending requests' },
    { title: 'Active Sessions', items: active, icon: MessageSquare, color: 'text-emerald-600', emptyText: 'No active sessions' },
    { title: 'Completed', items: completed, icon: CheckCircle2, color: 'text-gray-500', emptyText: 'No completed sessions' },
    { title: 'Declined', items: declined, icon: XCircle, color: 'text-red-500', emptyText: 'No declined sessions' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={fadeInUpTransition}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Inbox size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mentorship Sessions</h1>
            <p className="text-sm text-gray-500">{sessions.length} total session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {sessions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No session requests yet</p>
          <p className="text-xs text-gray-400 mt-1">When students book sessions with you, they will appear here.</p>
        </div>
      )}

      {/* Sections */}
      {sections.map(section => {
        if (section.items.length === 0 && sessions.length === 0) return null
        const SectionIcon = section.icon

        return (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <SectionIcon size={16} className={section.color} />
              <h2 className="text-sm font-semibold text-gray-700">{section.title}</h2>
              <span className="text-xs text-gray-400">({section.items.length})</span>
            </div>

            {section.items.length === 0 ? (
              <div className="bg-white/60 rounded-lg border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400">{section.emptyText}</p>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {section.items.map(session => (
                  <motion.div key={session.id} variants={staggerItem}>
                    <MentorshipSessionCard
                      session={session}
                      viewAs="mentor"
                      onClick={() => router.push(`/mentor/dashboard/sessions/${session.id}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )
      })}
    </motion.div>
  )
}
