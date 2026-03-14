'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface BookSessionModalProps {
  mentor: { id: string; name: string; specialization: string | null }
  isOpen: boolean
  onClose: () => void
  onBooked: () => void
}

export default function BookSessionModal({ mentor, isOpen, onClose, onBooked }: BookSessionModalProps) {
  const [topic, setTopic] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [studentMessage, setStudentMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast.error('Please enter a topic for the session')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/mentor-sessions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentor.id,
          topic: topic.trim(),
          student_message: studentMessage.trim() || undefined,
          preferred_date: preferredDate || undefined,
          preferred_time: preferredTime || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to book session')
      }

      toast.success('Session request sent successfully!')
      setTopic('')
      setPreferredDate('')
      setPreferredTime('')
      setStudentMessage('')
      onBooked()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Book a Session</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  with {mentor.name}
                  {mentor.specialization && (
                    <span className="text-gray-400"> &middot; {mentor.specialization}</span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What would you like to discuss?"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar size={13} className="inline mr-1 -mt-0.5" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Clock size={13} className="inline mr-1 -mt-0.5" />
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={studentMessage}
                  onChange={(e) => setStudentMessage(e.target.value)}
                  placeholder="Any additional details or questions for the mentor..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !topic.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
