'use client'

import { create } from 'zustand'

export interface CourseModule {
  id: string
  title: string
  slug: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number
  category: string
  order_index: number
  segments_json: string | null
  created_at: string
}

export interface ModuleQuiz {
  id: string
  module_id: string
  trigger_at_seconds: number
  question: string
  options_json: string
  hint: string | null
  order_index: number
}

export interface UserProgress {
  id: string
  user_id: string
  module_id: string
  last_position_seconds: number
  quizzes_passed_json: string | null
  is_completed: number
  score: number
  updated_at: string
}

interface ClassroomState {
  // Module data
  currentModule: CourseModule | null
  quizzes: ModuleQuiz[]
  progress: UserProgress | null

  // Player state
  isPlaying: boolean
  currentTime: number
  duration: number

  // Quiz gate state
  showQuiz: boolean
  activeQuiz: ModuleQuiz | null
  quizzesPassed: number[] // trigger_at_seconds values that have been passed
  showHint: boolean
  lastHint: string | null

  // Actions
  setModule: (module: CourseModule, quizzes: ModuleQuiz[]) => void
  setProgress: (progress: UserProgress | null) => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  triggerQuiz: (quiz: ModuleQuiz) => void
  passQuiz: (triggerSeconds: number) => void
  dismissQuiz: () => void
  showQuizHint: (hint: string) => void
  reset: () => void
}

export const useClassroomStore = create<ClassroomState>((set) => ({
  currentModule: null,
  quizzes: [],
  progress: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  showQuiz: false,
  activeQuiz: null,
  quizzesPassed: [],
  showHint: false,
  lastHint: null,

  setModule: (module, quizzes) => set({ currentModule: module, quizzes }),
  setProgress: (progress) => {
    const passed = progress?.quizzes_passed_json
      ? JSON.parse(progress.quizzes_passed_json)
      : []
    set({ progress, quizzesPassed: passed })
  },
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  triggerQuiz: (quiz) => set({ showQuiz: true, activeQuiz: quiz, isPlaying: false, showHint: false, lastHint: null }),
  passQuiz: (triggerSeconds) =>
    set((state) => ({
      quizzesPassed: [...state.quizzesPassed, triggerSeconds],
      showQuiz: false,
      activeQuiz: null,
      isPlaying: true,
      showHint: false,
      lastHint: null,
    })),
  dismissQuiz: () => set({ showQuiz: false, activeQuiz: null }),
  showQuizHint: (hint) => set({ showHint: true, lastHint: hint }),
  reset: () =>
    set({
      currentModule: null,
      quizzes: [],
      progress: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      showQuiz: false,
      activeQuiz: null,
      quizzesPassed: [],
      showHint: false,
      lastHint: null,
    }),
}))
