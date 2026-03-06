import type { Metadata } from 'next'
import ForEmployersPage from './PageClient'

export const metadata: Metadata = {
  title: 'For Employers — Hire Pre-Assessed Talent',
  description:
    'Access a pipeline of pre-assessed, job-ready candidates on IKLAVYA. Reduce hiring costs by 60% with AI-verified skill profiles and video interview insights.',
  keywords: ['hire students', 'campus hiring', 'pre-assessed candidates', 'employer hiring platform', 'talent pipeline', 'reduce hiring costs'],
  openGraph: {
    title: 'For Employers — Hire Pre-Assessed Talent | IKLAVYA',
    description: 'Access pre-assessed, job-ready candidates. Reduce hiring costs by 60%.',
    url: '/for-employers',
  },
  alternates: { canonical: '/for-employers' },
}

export default function Page() {
  return <ForEmployersPage />
}
