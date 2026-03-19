import type { Metadata } from 'next'
import CertificationsPage from './PageClient'

export const metadata: Metadata = {
  title: 'Certifications & Badges',
  description:
    'Earn verifiable digital certificates and skill badges on UJJWAL BHAVISHYA. Showcase your achievements to employers with blockchain-verified credentials.',
  keywords: ['digital certificates', 'skill badges', 'online certification', 'verified credentials', 'career achievements'],
  openGraph: {
    title: 'Certifications & Badges — UJJWAL BHAVISHYA',
    description: 'Earn and showcase verifiable digital certificates and skill badges.',
    url: '/certifications',
  },
  alternates: { canonical: '/certifications' },
}

export default function Page() {
  return <CertificationsPage />
}
