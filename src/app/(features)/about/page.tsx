import type { Metadata } from 'next'
import AboutPage from './PageClient'

export const metadata: Metadata = {
  title: 'About Us — Our Mission & Vision',
  description:
    'Learn about IKLAVYA — India\'s AI-powered career readiness platform helping students ace interviews, build resumes, and develop job-ready skills.',
  keywords: ['about iklavya', 'career readiness mission', 'AI education platform', 'student employability India'],
  openGraph: {
    title: 'About IKLAVYA — AI Career Readiness Platform',
    description:
      'Empowering students with AI-driven mock interviews, skill assessments, resume building and career guidance.',
    url: '/about',
  },
  alternates: { canonical: '/about' },
}

export default function Page() {
  return <AboutPage />
}
