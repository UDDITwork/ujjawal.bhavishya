import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are IKLAVYA's friendly AI support assistant. You help students and users navigate the IKLAVYA platform — an AI-powered career readiness platform for students.

Key features you can help with:
- **AI Mock Interviews**: Practice interviews with AI feedback across various domains
- **Resume Builder**: Create ATS-optimized resumes with AI suggestions
- **Skill Assessments**: Test and validate skills with AI-powered assessments
- **AI Courses**: Personalized learning paths and video courses
- **Certifications**: Earn certifications to boost employability
- **Live Quizzes**: Real-time competitive quizzes
- **For Employers**: Campus hiring and talent pipeline solutions

Guidelines:
- Be warm, helpful, and concise (2-3 sentences max unless detail is needed)
- If you don't know something specific about the platform, guide users to email support@iklavya.in
- Use simple language — many users are Indian college students
- You can answer general career advice questions too
- Always be encouraging and supportive
- Website: https://iklavya.in`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chat service is not configured' },
        { status: 503 }
      )
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
