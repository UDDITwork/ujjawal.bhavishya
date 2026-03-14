import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const after = request.nextUrl.searchParams.get('after')
    let url = `${API_URL}/mentor-sessions/${id}`
    if (after) {
      url += `?after=${encodeURIComponent(after)}`
    }

    const res = await fetch(url, {
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
