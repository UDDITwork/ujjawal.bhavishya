import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPasswordClient from './PageClient'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your UJJWAL BHAVISHYA account.',
  robots: { index: false, follow: true },
}

export default function Page() {
  return (
    <Suspense fallback={<div className="w-full max-w-md text-center p-8 text-gray-400">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
