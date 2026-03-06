import type { Metadata } from 'next'
import CertificationsPage from './PageClient'

export const metadata: Metadata = {
  title: 'Certifications & Badges',
  description:
    'Earn verifiable digital certificates and skill badges on IKLAVYA. Showcase your achievements to employers with blockchain-verified credentials.',
  keywords: ['digital certificates', 'skill badges', 'online certification', 'verified credentials', 'career achievements'],
  openGraph: {
    title: 'Certifications & Badges — IKLAVYA',
    description: 'Earn and showcase verifiable digital certificates and skill badges.',
    url: '/certifications',
  },
  alternates: { canonical: '/certifications' },
}

export default function Page() {
  return <CertificationsPage />
}
