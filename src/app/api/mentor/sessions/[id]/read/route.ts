import { NextRequest, NextResponse } from 'next/server'
import { getMentorAuthCookie } from '@/lib/mentor-auth'

const API_URL = process.env.API_URL!

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = await getMentorAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const res = await fetch(`${API_URL}/mentor-sessions/${id}/mark-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Failed' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
