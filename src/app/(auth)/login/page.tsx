import type { Metadata } from 'next'
import LoginPage from './PageClient'

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your IKLAVYA account to access AI interviews, courses, resume builder and career guidance.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/login' },
}

export default function Page() {
  return <LoginPage />
}
