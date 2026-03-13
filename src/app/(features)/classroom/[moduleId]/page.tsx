'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useClassroomStore } from '@/store/classroom-store'
import VideoPlayer from '@/components/classroom/VideoPlayer'
import CurriculumSidebar from '@/components/classroom/CurriculumSidebar'
import { fadeInUp, fadeInUpTransition } from '@/lib/animations'

export default function ClassroomModulePage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  const { currentModule, setModule, setProgress, reset } = useClassroomStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen for seek events from curriculum sidebar
  useEffect(() => {
    function handleSeek(e: Event) {
      const customEvent = e as CustomEvent<number>
      const video = document.querySelector('video')
      if (video) {
        video.currentTime = customEvent.detail
      }
    }
    window.addEventListener('classroom:seek', handleSeek)
    return () => window.removeEventListener('classroom:seek', handleSeek)
  }, [])

  const loadModuleData = useCallback(async () => {
    try {
      // Fetch module detail + quizzes
      const moduleRes = await fetch(`/api/modules/${moduleId}`)
      if (!moduleRes.ok) {
        if (moduleRes.status === 401) {
          router.push('/login')
          return
        }
        setError('Module not found')
        return
      }
      const moduleData = await moduleRes.json()
      setModule(moduleData.module, moduleData.quizzes)

      // Fetch progress (may 404 if new)
      try {
        const progressRes = await fetch(`/api/modules/${moduleId}/progress`)
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          setProgress(progressData)
        }
      } catch {
        // No progress yet — that's fine
      }
    } catch {
      toast.error('Failed to load module')
      setError('Failed to load module')
    } finally {
      setLoading(false)
    }
  }, [moduleId, router, setModule, setProgress])

  useEffect(() => {
    reset()
    loadModuleData()
    return () => reset()
  }, [loadModuleData, reset])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !currentModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BookOpen size={48} className="text-gray-300" />
        <p className="text-gray-500">{error || 'Module not found'}</p>
        <Link
          href="/classroom"
          className="text-sm text-green-700 hover:text-green-800 font-medium"
        >
          Back to Classroom
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Back link */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
      >
        <Link
          href="/classroom"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Modules
        </Link>
      </motion.div>

      {/* Module title */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...fadeInUpTransition, delay: 0.05 }}
        className="mb-5"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {currentModule.title}
        </h1>
        {currentModule.description && (
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            {currentModule.description}
          </p>
        )}
      </motion.div>

      {/* Two-pane layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Video Player */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <VideoPlayer />
        </motion.div>

        {/* Right: Curriculum */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.15 }}
          className="w-full lg:w-80 shrink-0"
        >
          <CurriculumSidebar />
        </motion.div>
      </div>
    </div>
  )
}
