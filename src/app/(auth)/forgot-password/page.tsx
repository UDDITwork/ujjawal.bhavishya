import type { Metadata } from 'next'
import ForgotPasswordClient from './PageClient'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your IKLAVYA account password.',
  robots: { index: false, follow: true },
}

export default function Page() {
  return <ForgotPasswordClient />
}
