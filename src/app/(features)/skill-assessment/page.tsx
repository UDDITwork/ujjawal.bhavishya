import type { Metadata } from 'next'
import SkillAssessmentPage from './PageClient'

export const metadata: Metadata = {
  title: 'AI Skill Assessment',
  description:
    'Discover your strengths and gaps with IKLAVYA\'s AI skill assessment. Get a detailed radar chart of communication, leadership, confidence and more.',
  keywords: ['skill assessment', 'AI skill test', 'soft skills evaluation', 'competency analysis', 'skill gap analysis'],
  openGraph: {
    title: 'AI Skill Assessment — IKLAVYA',
    description: 'AI-powered skill assessment with detailed radar charts and personalised roadmaps.',
    url: '/skill-assessment',
  },
  alternates: { canonical: '/skill-assessment' },
}

export default function Page() {
  return <SkillAssessmentPage />
}
