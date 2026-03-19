import type { Metadata } from 'next'
import AIInterviewPage from './PageClient'

export const metadata: Metadata = {
  title: 'AI Mock Interview Simulator',
  description:
    'Practice job interviews with UJJWAL BHAVISHYA\'s AI interviewer. Get real-time feedback on confidence, communication and content to ace your next interview.',
  keywords: ['AI mock interview', 'interview practice', 'interview simulator', 'job interview preparation', 'AI interviewer'],
  openGraph: {
    title: 'AI Mock Interview Simulator — UJJWAL BHAVISHYA',
    description: 'Practice with an AI interviewer and get instant feedback on your performance.',
    url: '/ai-interview',
  },
  alternates: { canonical: '/ai-interview' },
}

export default function Page() {
  return <AIInterviewPage />
}
