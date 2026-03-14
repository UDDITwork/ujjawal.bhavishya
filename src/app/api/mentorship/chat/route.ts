import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()

    const res = await fetch(`${API_URL}/mentorship/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      return new Response(JSON.stringify({ error: data.detail || 'Chat failed' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Stream SSE through
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
