'use client'

import { Github, Twitter, Linkedin, Instagram, Send, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function CinematicFooter() {
  const [email, setEmail] = useState('')

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
                width={140}
                height={70}
                className="h-10 w-auto object-contain brightness-0 invert"
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800
                  text-white placeholder:text-slate-600 focus:outline-none
                  focus:border-green-700 focus:ring-1 focus:ring-green-700/30
                  transition-all duration-200 text-sm"
              />
              <button className="w-full px-5 py-3 rounded-lg bg-green-800 hover:bg-green-700 text-white text-sm font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2">
                <Send size={14} />
                Subscribe
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
