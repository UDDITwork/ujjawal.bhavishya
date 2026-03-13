'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { useState } from 'react'
import { useClassroomStore } from '@/store/classroom-store'
import QuizOverlay from './QuizOverlay'

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastSyncRef = useRef(0)

  const {
    currentModule,
    quizzes,
    isPlaying,
    currentTime,
    quizzesPassed,
    showQuiz,
    setPlaying,
    setCurrentTime,
    setDuration,
    triggerQuiz,
  } = useClassroomStore()

  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)

  // Get the next quiz gate the student hasn't passed
  const getNextUnpassedQuiz = useCallback(
    (time: number) => {
      return quizzes.find(
        (q) =>
          !quizzesPassed.includes(q.trigger_at_seconds) &&
          time >= q.trigger_at_seconds - 0.5
      )
    },
    [quizzes, quizzesPassed]
  )

  // Get max seekable position (can't seek past unpassed quiz)
  const getMaxSeekable = useCallback(() => {
    const unpassedTimestamps = quizzes
      .filter((q) => !quizzesPassed.includes(q.trigger_at_seconds))
      .map((q) => q.trigger_at_seconds)

    if (unpassedTimestamps.length === 0) {
      return currentModule?.duration_seconds || 600
    }
    return Math.min(...unpassedTimestamps)
  }, [quizzes, quizzesPassed, currentModule])

  // Handle time update — check for quiz triggers
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const time = video.currentTime
    setCurrentTime(time)

    // Check quiz gates
    const quizToTrigger = getNextUnpassedQuiz(time)
    if (quizToTrigger && !showQuiz) {
      video.pause()
      video.currentTime = quizToTrigger.trigger_at_seconds
      triggerQuiz(quizToTrigger)
      return
    }

    // Throttled progress sync (every 10 seconds)
    if (Math.floor(time) - lastSyncRef.current >= 10) {
      lastSyncRef.current = Math.floor(time)
      syncProgress(time)
    }
  }, [getNextUnpassedQuiz, showQuiz, setCurrentTime, triggerQuiz])

  // Prevent seeking past quiz gates
  const handleSeeking = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const maxSeekable = getMaxSeekable()
    if (video.currentTime > maxSeekable) {
      video.currentTime = maxSeekable
    }
  }, [getMaxSeekable])

  // Sync playing state to video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying && !showQuiz) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isPlaying, showQuiz])

  // Sync progress to backend
  async function syncProgress(time: number) {
    if (!currentModule) return
    try {
      await fetch('/api/modules/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: currentModule.id,
          last_position_seconds: Math.floor(time),
          quizzes_passed_json: JSON.stringify(quizzesPassed),
          score: quizzesPassed.length,
          is_completed:
            time >= (currentModule.duration_seconds - 5) &&
            quizzes.every((q) => quizzesPassed.includes(q.trigger_at_seconds))
              ? 1
              : 0,
        }),
      })
    } catch {
      // Silent fail — will retry on next heartbeat
    }
  }

  function togglePlay() {
    if (showQuiz) return
    setPlaying(!isPlaying)
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    setMuted(!muted)
    video.muted = !muted
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (videoRef.current) {
      videoRef.current.volume = v
    }
    setMuted(v === 0)
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current
    if (!video || showQuiz) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const seekTo = pct * (currentModule?.duration_seconds || 600)
    const maxSeekable = getMaxSeekable()
    video.currentTime = Math.min(seekTo, maxSeekable)
  }

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  const duration = currentModule?.duration_seconds || 600
  const progressPct = (currentTime / duration) * 100
  const maxSeekPct = (getMaxSeekable() / duration) * 100

  // Format time as M:SS
  function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Quiz gate markers
  const quizMarkers = quizzes.map((q) => ({
    position: (q.trigger_at_seconds / duration) * 100,
    passed: quizzesPassed.includes(q.trigger_at_seconds),
  }))

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden group"
      style={{ aspectRatio: '16/9' }}
    >
      <video
        ref={videoRef}
        src={currentModule?.video_url}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration)
          }
        }}
        onEnded={() => {
          setPlaying(false)
          syncProgress(duration)
        }}
        playsInline
        preload="metadata"
      />

      {/* Quiz overlay */}
      <QuizOverlay />

      {/* Controls overlay (hidden during quiz) */}
      {!showQuiz && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 pt-12">
          {/* Progress bar */}
          <div
            className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/progress"
            onClick={handleProgressClick}
          >
            {/* Seekable area */}
            <div
              className="absolute top-0 left-0 h-full bg-white/10 rounded-full"
              style={{ width: `${maxSeekPct}%` }}
            />
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-[width] duration-100"
              style={{ width: `${progressPct}%` }}
            />
            {/* Quiz markers */}
            {quizMarkers.map((marker, i) => (
              <div
                key={i}
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white ${
                  marker.passed ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ left: `${marker.position}%`, transform: 'translate(-50%, -50%)' }}
                title={marker.passed ? 'Quiz passed' : 'Quiz gate'}
              />
            ))}
            {/* Scrubber thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progressPct}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
                  {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 appearance-none bg-white/30 rounded-full accent-white cursor-pointer"
                />
              </div>

              <span className="text-white/80 text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Play button center overlay (when paused, no quiz) */}
      {!isPlaying && !showQuiz && currentTime > 0 && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Play size={28} className="text-white ml-1" />
          </div>
        </button>
      )}

      {/* Initial play overlay */}
      {!isPlaying && !showQuiz && currentTime === 0 && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-green-600/90 flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg">
              <Play size={32} className="text-white ml-1" />
            </div>
            <span className="text-white/90 text-sm font-medium">Start Lesson</span>
          </div>
        </button>
      )}
    </div>
  )
}
