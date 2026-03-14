'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatMsg {
  id: string
  session_id: string
  sender_type: string
  sender_id: string
  sender_name: string
  content: string
  message_order: number
  created_at: string
}

interface MentorChatProps {
  sessionId: string
  userType: 'student' | 'mentor'
  currentUserId: string
  currentUserName: string
  sessionStatus: string
  otherPartyName: string
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function MentorChat({
  sessionId,
  userType,
  currentUserId,
  currentUserName,
  sessionStatus,
  otherPartyName,
}: MentorChatProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mentorNote, setMentorNote] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const basePath = userType === 'student'
    ? `/api/mentor-sessions/${sessionId}`
    : `/api/mentor/sessions/${sessionId}`

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load initial session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch(basePath)
        if (!res.ok) throw new Error('Failed to load session')
        const data = await res.json()

        const sessionMessages: ChatMsg[] = data.messages || data.session?.messages || []
        setMessages(sessionMessages)

        const note = data.mentor_note || data.session?.mentor_note || null
        setMentorNote(note)
      } catch {
        toast.error('Failed to load chat messages')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [basePath])

  // Mark as read on mount
  useEffect(() => {
    const markRead = async () => {
      try {
        await fetch(`${basePath}/read`, { method: 'POST' })
      } catch {
        // silent fail
      }
    }
    markRead()
  }, [basePath])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Polling for new messages
  useEffect(() => {
    if (loading) return

    const poll = async () => {
      if (document.visibilityState === 'hidden') return

      try {
        const lastMsg = messages[messages.length - 1]
        const after = lastMsg ? lastMsg.created_at : ''
        const separator = basePath.includes('?') ? '&' : '?'
        const url = after ? `${basePath}${separator}after=${encodeURIComponent(after)}` : basePath

        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()

        const newMessages: ChatMsg[] = data.messages || data.session?.messages || []
        if (newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const fresh = newMessages.filter((m) => !existingIds.has(m.id))
            if (fresh.length === 0) return prev
            return [...prev, ...fresh].sort((a, b) => a.message_order - b.message_order)
          })

          // Mark as read when new messages arrive
          try {
            await fetch(`${basePath}/read`, { method: 'POST' })
          } catch {
            // silent
          }
        }
      } catch {
        // silent polling failure
      }
    }

    pollingRef.current = setInterval(poll, 5000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && pollingRef.current === null) {
        pollingRef.current = setInterval(poll, 5000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = null
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [loading, messages, basePath])

  // Send message
  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending) return

    const sendPath = userType === 'student'
      ? `${basePath}/messages`
      : `${basePath}/send`

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: ChatMsg = {
      id: tempId,
      session_id: sessionId,
      sender_type: userType,
      sender_id: currentUserId,
      sender_name: currentUserName,
      content,
      message_order: messages.length + 1,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setInput('')
    setSending(true)

    try {
      const res = await fetch(sendPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send message')
      }

      const data = await res.json()
      // Replace optimistic message with real one
      if (data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        )
      }
    } catch (err: unknown) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      const message = err instanceof Error ? err.message : 'Failed to send message'
      toast.error(message)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canChat = sessionStatus === 'accepted'

  // Status banners
  const renderStatusBanner = () => {
    switch (sessionStatus) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            <CheckCircle2 size={16} className="text-gray-400" />
            This session has been completed.
          </div>
        )
      case 'requested':
        return (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <Loader2 size={16} className="animate-spin" />
            {userType === 'student'
              ? 'Waiting for mentor to accept this request...'
              : 'This session is pending your response.'}
          </div>
        )
      case 'rejected':
        return (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <p>This request was declined.</p>
            {mentorNote && (
              <p className="mt-1 text-red-600 italic">&ldquo;{mentorNote}&rdquo;</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-emerald-700" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Status banner */}
      {sessionStatus !== 'accepted' && (
        <div className="px-4 py-3">
          {renderStatusBanner()}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare size={32} className="mb-2" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p
                    className={`text-[11px] font-medium mb-0.5 ${
                      isOwn ? 'text-emerald-200' : 'text-gray-400'
                    }`}
                  >
                    {msg.sender_name}
                  </p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isOwn ? 'text-emerald-300' : 'text-gray-400'
                    }`}
                  >
                    {formatTimestamp(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {canChat && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${otherPartyName}...`}
              rows={1}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              style={{ maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  )
}
