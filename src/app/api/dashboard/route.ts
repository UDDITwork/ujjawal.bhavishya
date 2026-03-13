import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function GET() {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const headers = { Authorization: `Bearer ${token}` }

    const [profileRes, sessionsRes, resumeRes] = await Promise.allSettled([
      fetch(`${API_URL}/profile`, { headers }),
      fetch(`${API_URL}/sessions`, { headers }),
      fetch(`${API_URL}/resume/sessions`, { headers }),
    ])

    const profile =
      profileRes.status === 'fulfilled' && profileRes.value.ok
        ? await profileRes.value.json()
        : null

    const sessions =
      sessionsRes.status === 'fulfilled' && sessionsRes.value.ok
        ? await sessionsRes.value.json()
        : { sessions: [] }

    const resumeSessions =
      resumeRes.status === 'fulfilled' && resumeRes.value.ok
        ? await resumeRes.value.json()
        : { sessions: [] }

    return NextResponse.json({
      profile,
      sessions: sessions.sessions || [],
      resumeSessions: resumeSessions.sessions || [],
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
