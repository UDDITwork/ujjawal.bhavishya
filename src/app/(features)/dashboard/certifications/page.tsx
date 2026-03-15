'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, ExternalLink } from 'lucide-react'
import { fadeInUp, fadeInUpTransition, staggerContainer, staggerItem } from '@/lib/animations'

interface Certificate {
  id: string
  cert_number: string
  cert_slug: string
  module_title: string | null
  score: number | null
  issued_at: string
}

export default function CertificationsPage() {
  const router = useRouter()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/certificates/my')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (res.ok) {
          const data = await res.json()
          setCerts(data.certificates || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={fadeInUpTransition}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
        <p className="text-gray-500 mt-1">
          Credentials earned upon successful completion of assessments
        </p>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : certs.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeInUpTransition, delay: 0.1 }}
        >
          <div className="border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-lg text-gray-500 mb-2">No certificates earned yet</p>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              Complete classroom modules and pass the associated assessments to receive your certifications.
            </p>
            <button
              onClick={() => router.push('/dashboard/assessments')}
              className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition-colors"
            >
              Go to Assessments
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {certs.map((cert, idx) => {
            const date = new Date(cert.issued_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })

            return (
              <motion.div key={cert.id} variants={staggerItem}>
                <div className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between p-5 gap-4">
                    {/* Left: Number + Details */}
                    <div className="flex items-start gap-4 min-w-0">
                      <span className="text-2xl font-bold text-gray-300 tabular-nums shrink-0 w-8 text-right">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {cert.module_title || 'Certificate'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                          <span>{date}</span>
                          {cert.score !== null && (
                            <span>Score: <span className="font-semibold text-gray-700">{cert.score}</span></span>
                          )}
                          <span className="text-gray-400 text-xs">{cert.cert_number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: View button */}
                    <a
                      href={`/cert/${cert.cert_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      View
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
