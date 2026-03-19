import type { Metadata } from 'next'
import SupportPage from './PageClient'

export const metadata: Metadata = {
  title: 'Support & Mentorship',
  description:
    'Get help from UJJWAL BHAVISHYA\'s support team or book 1-on-1 mentorship sessions. Browse FAQs, submit tickets, and connect with industry mentors.',
  keywords: ['student support', 'mentorship', 'career mentoring', 'FAQ', 'help center'],
  openGraph: {
    title: 'Support & Mentorship — UJJWAL BHAVISHYA',
    description: 'Browse FAQs, submit support tickets, or book mentorship sessions.',
    url: '/support',
  },
  alternates: { canonical: '/support' },
}

export default function Page() {
  return <SupportPage />
}
