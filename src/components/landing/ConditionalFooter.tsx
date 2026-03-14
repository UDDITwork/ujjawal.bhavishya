'use client'

import { usePathname } from 'next/navigation'
import CinematicFooter from './CinematicFooter'

const noFooterPrefixes = ['/dashboard', '/admin', '/profile', '/sessions']

export default function ConditionalFooter() {
  const pathname = usePathname()
  const shouldHide = noFooterPrefixes.some((p) => pathname.startsWith(p))
  if (shouldHide) return null
  return <CinematicFooter />
}
