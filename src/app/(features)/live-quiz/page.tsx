import type { Metadata } from 'next'
import LiveQuizPage from './PageClient'

export const metadata: Metadata = {
  title: 'Live Quiz Arena',
  description:
    'Compete in real-time quiz competitions on IKLAVYA. Test your knowledge, climb the leaderboard, and win badges in gamified learning battles.',
  keywords: ['live quiz', 'quiz competition', 'gamified learning', 'online quiz', 'leaderboard'],
  openGraph: {
    title: 'Live Quiz Arena — IKLAVYA',
    description: 'Compete in real-time quiz battles and climb the leaderboard.',
    url: '/live-quiz',
  },
  alternates: { canonical: '/live-quiz' },
}

export default function Page() {
  return <LiveQuizPage />
}
