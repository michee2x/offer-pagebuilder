import { NextResponse } from 'next/server'
import { getSession } from '@/auth'

const VERCEL_TOKEN = process.env.VERCEL_ACCESS_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

/**
 * GET /api/domains/status?domain=www.example.com
 *
 * Checks the real-time DNS verification status of a custom domain
 * via the Vercel Domains API. Returns:
 *  - verified: boolean
 *  - configured: boolean  (domain is on the project)
 *  - verification: array of DNS record check results
 *  - error: string | null
 */
export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json({ error: 'domain query param is required' }, { status: 400 })
    }

    // If Vercel is not configured, return a graceful no-op response
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json({
        verified: false,
        configured: false,
        verification: [],
        error: 'Vercel integration not configured',
        noVercel: true,
      })
    }

    const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
    const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}${teamQuery}`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      // Don't cache — we need fresh DNS status every poll
      cache: 'no-store',
    })

    if (res.status === 404) {
      // Domain not yet registered on Vercel project
      return NextResponse.json({
        verified: false,
        configured: false,
        verification: [],
        error: 'Domain not registered on project yet',
      })
    }

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        verified: false,
        configured: false,
        verification: [],
        error: data?.error?.message || 'Failed to check domain status',
      })
    }

    return NextResponse.json({
      verified: data.verified === true,
      configured: true,
      verification: data.verification || [],
      apexName: data.apexName,
      createdAt: data.createdAt,
      error: null,
    })
  } catch (error: any) {
    console.error('[Domain Status] Error:', error)
    return NextResponse.json(
      { verified: false, configured: false, verification: [], error: error.message },
      { status: 500 }
    )
  }
}
