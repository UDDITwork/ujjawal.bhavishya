import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/session/', '/resume-session/', '/admin'],
      },
    ],
    sitemap: 'https://iklavya.in/sitemap.xml',
  }
}
