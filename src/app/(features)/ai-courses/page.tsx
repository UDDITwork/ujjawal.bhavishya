import type { Metadata } from 'next'
import AICoursesPage from './PageClient'

export const metadata: Metadata = {
  title: 'AI-Powered Video Courses',
  description:
    'Master soft skills, communication, leadership and more with UJJWAL BHAVISHYA\'s AI-curated video courses designed for career success.',
  keywords: ['online courses', 'soft skills training', 'communication course', 'leadership training', 'video learning'],
  openGraph: {
    title: 'AI-Powered Video Courses — UJJWAL BHAVISHYA',
    description: 'Career-focused video courses covering communication, leadership, negotiation and more.',
    url: '/ai-courses',
  },
  alternates: { canonical: '/ai-courses' },
}

export default function Page() {
  return <AICoursesPage />
}
