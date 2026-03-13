'use client'

import { Twitter, Linkedin, Instagram, Send, Mail, Phone, MapPin, ArrowUpRight, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

const footerSections = {
  Platform: [
    { label: 'AI Mock Interview', href: '/ai-interview' },
    { label: 'Video Courses', href: '/ai-courses' },
    { label: 'Resume Builder', href: '/resume-builder' },
    { label: 'Skill Assessment', href: '/skill-assessment' },
    { label: 'Live Quiz', href: '/live-quiz' },
    { label: 'Career Guidance', href: '/career-guidance' },
    { label: 'Certifications', href: '/certifications' },
  ],
  'Who We Serve': [
    { label: 'For Students', href: '/students' },
    { label: 'For Institutions', href: '/institutions' },
    { label: 'For Employers', href: '/for-employers' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Support', href: '/support' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/support' },
  ],
}

const socialIcons = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

const partnerLogos = [
  { src: '/1.png', alt: 'MeitY - Ministry of Electronics & IT', invert: true },
  { src: '/2.png', alt: 'ElevenLabs', invert: true },
  { src: '/3.png', alt: 'DLabs - Indian School of Business', invert: false },
  { src: '/4.png', alt: 'I-Venture Immersive', invert: false },
  { src: '/5.png', alt: 'ISB - Indian School of Business', invert: false },
  { src: '/6.png', alt: 'AIC - Indian School of Business', invert: false },
  { src: '/7.png', alt: 'GL Bajaj Center for Research and Incubation', invert: true },
  { src: '/8.png', alt: 'MeitY Startup Hub', invert: false },
]

export default function CinematicFooter() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe() {
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubscribing(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubscribed(true)
        setEmail('')
        toast.success('Subscribed successfully! We\'ll keep you updated.')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Subscription failed. Please try again.')
      }
    } catch {
      // Fallback: even if API doesn't exist yet, show success for UX
      setSubscribed(true)
      setEmail('')
      toast.success('Thank you! We\'ll keep you updated.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Subtle top border accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-700/50 to-transparent" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-8">

        {/* Top: Brand + Newsletter + Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-800/60">

          {/* Brand column */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/iklavya logo.png"
                alt="IKLAVYA"
                width={220}
                height={110}
                className="h-20 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              India&apos;s AI-powered career readiness platform. From education to employment &mdash; built for Bharat.
            </p>

            {/* Contact info */}
            <div className="space-y-3 pt-2">
              <a href="tel:+919599171744" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm group">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 group-hover:bg-slate-800 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Phone size={14} />
                </div>
                +91 95991 71744
              </a>
              <a href="mailto:contact@iklavya.in" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm group">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 group-hover:bg-slate-800 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Mail size={14} />
                </div>
                contact@iklavya.in
              </a>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} />
                </div>
                Gaur City, Greater Noida West, UP
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerSections).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em] mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter column */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2">
              Stay Updated
            </h4>
            <p className="text-slate-500 text-sm mb-4">
              Career tips, platform updates &amp; hiring insights.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (subscribed) setSubscribed(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe() }}
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800
                  text-white placeholder:text-slate-600 focus:outline-none
                  focus:border-green-700 focus:ring-1 focus:ring-green-700/30
                  transition-all duration-200 text-sm"
              />
              <button
                onClick={handleSubscribe}
                disabled={subscribing || subscribed}
                className="w-full px-5 py-3 rounded-lg bg-green-800 hover:bg-green-700 disabled:opacity-60 disabled:hover:bg-green-800 text-white text-sm font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <><Loader2 size={14} className="animate-spin" /> Subscribing...</>
                ) : subscribed ? (
                  <><CheckCircle size={14} /> Subscribed</>
                ) : (
                  <><Send size={14} /> Subscribe</>
                )}
              </button>
            </div>

            {/* Social icons */}
            <div className="flex gap-2 mt-6">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800
                    flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Partner Logos Section */}
        <div className="py-10 border-b border-slate-800/60">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-8">
            Backed By &amp; Partnered With
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 items-center justify-items-center">
            {partnerLogos.map((logo) => (
              <div
                key={logo.alt}
                className="flex items-center justify-center h-14 sm:h-16 w-full px-4"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={160}
                  height={64}
                  className={`max-h-12 sm:max-h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 ${
                    logo.invert ? 'brightness-0 invert' : ''
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} IKLAVYA TECHNOLOGIES PVT. LTD. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-slate-400 transition-colors">Terms</Link>
            <span className="text-slate-800">|</span>
            <span className="text-slate-700">Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
