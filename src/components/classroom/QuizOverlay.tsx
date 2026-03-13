'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useClassroomStore, type ModuleQuiz } from '@/store/classroom-store'
import { playSuccess, playPop } from '@/lib/sounds'

export default function QuizOverlay() {
  const { showQuiz, activeQuiz, showHint, lastHint, passQuiz, showQuizHint } =
    useClassroomStore()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)

  if (!showQuiz || !activeQuiz) return null

  const options: string[] = JSON.parse(activeQuiz.options_json)

  async function handleSubmit() {
    if (selectedIndex === null) {
      toast.error('Please select an answer')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/modules/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: activeQuiz!.id,
          selected_index: selectedIndex,
        }),
      })

      const data = await res.json()

      if (data.correct) {
        setResult('correct')
        playSuccess()
        toast.success('Correct! Great job!')
        setTimeout(() => {
          passQuiz(activeQuiz!.trigger_at_seconds)
          resetState()
        }, 1200)
      } else {
        setResult('incorrect')
        playPop()
        toast.error('Not quite — try again!')
        if (data.hint) {
          showQuizHint(data.hint)
        }
        setTimeout(() => {
          setResult(null)
          setSelectedIndex(null)
        }, 800)
      }
    } catch {
      toast.error('Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  function resetState() {
    setSelectedIndex(null)
    setResult(null)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex items-center justify-center"
      >
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* Quiz card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-emerald-700 px-6 py-4">
            <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              KNOWLEDGE CHECK
            </div>
            <h3 className="text-white font-bold text-base leading-snug">
              {activeQuiz.question}
            </h3>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {options.map((option, idx) => {
              const isSelected = selectedIndex === idx
              const isCorrect = result === 'correct' && isSelected
              const isWrong = result === 'incorrect' && isSelected

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!submitting && !result) {
                      setSelectedIndex(idx)
                      playPop()
                    }
                  }}
                  disabled={submitting || result === 'correct'}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all duration-200 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : isWrong
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : isSelected
                          ? 'border-green-600 bg-green-50/50 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCorrect
                        ? 'bg-green-500 text-white'
                        : isWrong
                          ? 'bg-red-400 text-white'
                          : isSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle size={14} />
                    ) : isWrong ? (
                      <XCircle size={14} />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </span>
                  {option}
                </button>
              )
            })}

            {/* Hint */}
            <AnimatePresence>
              {showHint && lastHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">{lastHint}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={selectedIndex === null || submitting || result === 'correct'}
              className="w-full mt-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:hover:bg-green-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Checking...</>
              ) : result === 'correct' ? (
                <><CheckCircle size={16} /> Correct!</>
              ) : (
                'Submit Answer'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
