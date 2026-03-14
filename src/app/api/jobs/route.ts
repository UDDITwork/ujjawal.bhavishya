import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface JobPost {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  experience: string
  description: string
  requirements: string[]
  postedAt: string
  sourceUrl: string
  sourceName: string
  category: string
  tags: string[]
  matchScore?: number
  isApplied?: boolean
  isSaved?: boolean
}

/* ------------------------------------------------------------------ */
/*  GET handler — proxy to backend /jobs/feed                          */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Forward all query params to backend
    const params = req.nextUrl.searchParams.toString()
    const res = await fetch(`${API_URL}/jobs/feed?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()

    if (!res.ok) {
      // If backend returned 0 jobs and we're in dev (no Firecrawl key), serve mock data
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch jobs' },
        { status: res.status }
      )
    }

    // Dev fallback: if backend returns 0 jobs and no FIRECRAWL_API_KEY, use mocks
    if (
      data.total === 0 &&
      !process.env.FIRECRAWL_API_KEY
    ) {
      const category = req.nextUrl.searchParams.get('category') || 'all'
      const search = req.nextUrl.searchParams.get('search') || ''
      const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
      const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')

      let allJobs = generateMockJobs(category)

      if (search) {
        const q = search.toLowerCase()
        allJobs = allJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(q) ||
            job.company.toLowerCase().includes(q) ||
            job.location.toLowerCase().includes(q) ||
            job.tags.some((t) => t.toLowerCase().includes(q)) ||
            job.description.toLowerCase().includes(q)
        )
      }

      const paginated = allJobs.slice((page - 1) * limit, page * limit)

      return NextResponse.json({
        jobs: paginated,
        total: allJobs.length,
        page,
        hasMore: page * limit < allJobs.length,
      })
    }

    return NextResponse.json(data)
  } catch {
    // Connection error to backend — serve mock data in dev
    if (!process.env.FIRECRAWL_API_KEY) {
      const category = req.nextUrl.searchParams.get('category') || 'all'
      const mockJobs = generateMockJobs(category)
      return NextResponse.json({
        jobs: mockJobs.slice(0, 10),
        total: mockJobs.length,
        page: 1,
        hasMore: mockJobs.length > 10,
      })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data (dev fallback only)                                      */
/* ------------------------------------------------------------------ */

function generateMockJobs(category: string): JobPost[] {
  const mockData: JobPost[] = [
    {
      id: 'mock-1',
      title: 'Sales Executive - Field Sales',
      company: 'ABC Corp Pvt Ltd',
      location: 'Noida, UP',
      salary: '₹18,000 – ₹25,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'We are looking for energetic Sales Executives for our Delhi NCR operations. Candidates should have good communication skills in Hindi and English. Freshers with a go-getter attitude are welcome. Daily field visits to retail shops and small businesses required. Attractive incentives on achieving targets.',
      requirements: ['Graduate (BA/BCom/BBA)', 'Good communication in Hindi & English', 'Bike + DL preferred', 'Willingness to travel locally'],
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'sales',
      tags: ['Walk-in', 'Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-2',
      title: 'Receptionist / Front Desk Executive',
      company: 'Sunrise Hospital',
      location: 'Mumbai, Maharashtra',
      salary: '₹12,000 – ₹18,000/mo',
      type: 'Full-time',
      experience: 'Fresher - 1 year',
      description: 'Hiring a polite and presentable Front Desk Executive for our hospital reception. Must be comfortable handling patient queries, phone calls, and appointment scheduling. Basic computer knowledge required.',
      requirements: ['Graduate in any stream', 'Basic computer knowledge', 'Presentable personality', 'Hindi & English fluency'],
      postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'receptionist',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-3',
      title: 'Data Entry Operator - Work From Home',
      company: 'InfoTech Solutions',
      location: 'Remote / Delhi NCR',
      salary: '₹10,000 – ₹15,000/mo',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Data entry position with typing speed requirement of 30+ WPM. Work involves entering customer data, maintaining Excel sheets, and basic reporting. Fixed shift timing 10 AM - 7 PM. Laptop/desktop with internet required for WFH.',
      requirements: ['12th pass or Graduate', 'Typing speed 30+ WPM', 'MS Office / Excel knowledge', 'Laptop with internet (for WFH)'],
      postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'data-entry',
      tags: ['WFH Option', 'Freshers OK', 'Night Shift'],
    },
    {
      id: 'mock-4',
      title: 'Customer Care Executive - Voice Process',
      company: 'ConnectPlus BPO',
      location: 'Bangalore, Karnataka',
      salary: '₹14,000 – ₹20,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Inbound customer support for a leading telecom company. Must have good communication skills. Rotational shifts with cab facility provided. PF, ESI, and health insurance included. Freshers welcome - training provided.',
      requirements: ['Graduate (any stream)', 'Good communication in English + Hindi/Kannada', 'Comfortable with rotational shifts'],
      postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'customer-support',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-5',
      title: 'Telecaller - Insurance Sales',
      company: 'Bajaj Finserv Partner',
      location: 'Hyderabad, Telangana',
      salary: '₹12,000 – ₹18,000 + Incentives',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Outbound calling for insurance product promotion. Fixed salary plus attractive performance incentives. We provide complete product training. Hindi and Telugu speaking candidates preferred.',
      requirements: ['BA/BSc/BCom preferred', 'Good phone etiquette', 'Hindi + Telugu speaking preferred'],
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'telecalling',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-6',
      title: 'Showroom Sales Associate',
      company: 'Reliance Retail',
      location: 'Pune, Maharashtra',
      salary: '₹13,000 – ₹17,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Looking for energetic candidates for our retail store in Pune. Job involves assisting customers, maintaining product displays, and achieving daily sales targets. Employee discount on all products. Growth opportunities to floor manager.',
      requirements: ['12th pass or Graduate', 'Presentable and customer-friendly', 'Comfortable standing for long hours', 'Marathi/Hindi fluency'],
      postedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'retail',
      tags: ['Walk-in', 'Freshers OK'],
    },
    {
      id: 'mock-7',
      title: 'Office Admin / Coordinator',
      company: 'Sharma & Associates',
      location: 'Jaipur, Rajasthan',
      salary: '₹10,000 – ₹14,000/mo',
      type: 'Full-time',
      experience: 'No experience required',
      description: 'Office coordinator required for CA firm. Work includes document management, courier dispatch, client coordination, and basic admin tasks. Timings 9:30 AM to 6:30 PM. Immediate joining available.',
      requirements: ['12th pass minimum', 'Basic English reading/writing', 'Punctual and reliable'],
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'admin',
      tags: ['Immediate Joining', 'Freshers OK'],
    },
    {
      id: 'mock-8',
      title: 'Accounts Assistant - Tally Required',
      company: 'Gupta Traders',
      location: 'Lucknow, UP',
      salary: '₹12,000 – ₹16,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Accounts assistant needed for managing daily accounting entries in Tally ERP. Should know GST filing basics, bank reconciliation, and voucher entry. Good opportunity to learn practical accounting in a fast-paced trading firm.',
      requirements: ['BCom graduate', 'Tally ERP knowledge', 'GST filing basics', 'MS Excel proficiency'],
      postedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'accounts',
      tags: ['Freshers OK'],
    },
    {
      id: 'mock-9',
      title: 'Field Marketing Executive',
      company: 'Jio Platforms',
      location: 'Chennai, Tamil Nadu',
      salary: '₹15,000 – ₹22,000 + Incentives',
      type: 'Full-time',
      experience: '0 - 3 years',
      description: 'Field marketing role for promoting Jio fiber and broadband connections. Door-to-door sales and society activations. Petrol allowance and phone recharge provided. Unlimited earning potential with per-connection incentives.',
      requirements: ['Graduate preferred', 'Own two-wheeler + DL', 'Local area knowledge', 'Hindi/Tamil fluency'],
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'marketing',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-10',
      title: 'Back Office Executive - Night Shift',
      company: 'Global Data Services',
      location: 'Gurgaon, Haryana',
      salary: '₹16,000 – ₹22,000/mo',
      type: 'Full-time',
      experience: '0 - 1 year',
      description: 'Back office data processing role for international client. Night shift (9 PM - 6 AM) with cab facility and night shift allowance. Work involves data verification, report generation, and email processing.',
      requirements: ['Graduate in any stream', 'Good typing speed', 'Basic English proficiency', 'Comfortable with night shifts'],
      postedAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'data-entry',
      tags: ['Night Shift', 'Freshers OK'],
    },
    {
      id: 'mock-11',
      title: 'Delivery Partner - Bike Required',
      company: 'Swiggy',
      location: 'Mumbai, Maharashtra',
      salary: '₹15,000 – ₹25,000/mo',
      type: 'Full-time',
      experience: 'Fresher',
      description: 'Join Swiggy as a delivery partner. Flexible hours, weekly payouts. Own bike and valid DL required. Earn extra through peak hour bonuses and incentives.',
      requirements: ['Own bike + valid DL', '18+ years age', 'Smartphone with internet', 'Know local area'],
      postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://workindia.in',
      sourceName: 'WorkIndia',
      category: 'delivery',
      tags: ['Freshers OK', 'Immediate Joining', 'Incentives'],
    },
    {
      id: 'mock-12',
      title: 'Security Guard - Day/Night Shift',
      company: 'SIS Group',
      location: 'Delhi NCR',
      salary: '₹12,000 – ₹16,000/mo',
      type: 'Full-time',
      experience: 'No experience required',
      description: 'Security guard positions available for corporate offices and residential societies. Uniform and meals provided. PF and ESI benefits included.',
      requirements: ['10th pass minimum', 'Physically fit', 'Age 20-45', 'Hindi speaking'],
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'security',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-13',
      title: 'Warehouse Packing Helper',
      company: 'Amazon India',
      location: 'Bengaluru, Karnataka',
      salary: '₹13,000 – ₹18,000/mo',
      type: 'Full-time',
      experience: 'Fresher',
      description: 'Packing and sorting helper in Amazon fulfilment centre. Standing work for 8 hours. PF, ESI, and overtime pay. Free meals during shift. Transport provided from select locations.',
      requirements: ['10th pass minimum', 'Physically fit', 'Comfortable with standing work'],
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://workindia.in',
      sourceName: 'WorkIndia',
      category: 'warehouse',
      tags: ['Freshers OK', 'Immediate Joining'],
    },
    {
      id: 'mock-14',
      title: 'Cook / Kitchen Helper - Restaurant',
      company: 'Barbeque Nation',
      location: 'Pune, Maharashtra',
      salary: '₹14,000 – ₹20,000/mo',
      type: 'Full-time',
      experience: '0 - 2 years',
      description: 'Kitchen helper / assistant cook required for our restaurant. Knowledge of Indian cuisine preferred. Meals provided during shift. Growth opportunity to head cook position.',
      requirements: ['Basic cooking knowledge', 'Hygiene awareness', 'Hindi/Marathi speaking'],
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://naukri.com',
      sourceName: 'Naukri',
      category: 'cook',
      tags: ['Freshers OK'],
    },
    {
      id: 'mock-15',
      title: 'Electrician - Maintenance',
      company: 'Tata Projects',
      location: 'Hyderabad, Telangana',
      salary: '₹16,000 – ₹24,000/mo',
      type: 'Full-time',
      experience: '1 - 3 years',
      description: 'Electrician needed for building maintenance and repair work. ITI/diploma holders preferred. Tools and safety equipment provided.',
      requirements: ['ITI Electrician or equivalent', 'Knowledge of wiring and switchboards', 'Safety awareness'],
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUrl: 'https://indeed.com',
      sourceName: 'Indeed',
      category: 'electrician',
      tags: ['Immediate Joining'],
    },
  ]

  if (category === 'all') return mockData
  return mockData.filter((job) => job.category === category)
}
