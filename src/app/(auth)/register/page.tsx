import type { Metadata } from 'next'
import RegisterPage from './PageClient'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for UJJWAL BHAVISHYA — free AI-powered career readiness tools including mock interviews, resume builder, courses and skill assessments.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/register' },
}

export default function Page() {
  return <RegisterPage />
}
