import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

const VERCEL_TOKEN = process.env.VERCEL_ACCESS_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID // optional, only if project is in a team

/**
 * Calls the Vercel Domains API to add a custom domain to the project.
 * Returns { ok: boolean, vercelError?: string }
 */
async function addDomainToVercel(domain: string): Promise<{ ok: boolean; vercelError?: string }> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    // Vercel not configured — skip silently (allows local dev to still work)
    console.warn('[Vercel Domains] VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID not set. Skipping Vercel domain registration.')
    return { ok: true }
  }

  const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
  const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${teamQuery}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  })

  const data = await res.json()

  if (!res.ok) {
    // Domain already exists on this project — that's fine
    if (data?.error?.code === 'domain_already_in_use' || data?.error?.code === 'domain_already_exists') {
      return { ok: true }
    }
    return { ok: false, vercelError: data?.error?.message || 'Vercel domain registration failed' }
  }

  return { ok: true }
}

/**
 * Calls the Vercel Domains API to remove a custom domain from the project.
 */
async function removeDomainFromVercel(domain: string): Promise<void> {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return

  const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
  const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}${teamQuery}`

  await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  }).catch((err) => {
    console.warn('[Vercel Domains] Failed to remove domain from Vercel:', err)
  })
}

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId, subdomain, custom_domain } = await req.json()
    const userId = session.user.id

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // ── Fetch the current page so we can detect domain changes ──
    const { data: currentPage } = await supabase
      .from('builder_pages')
      .select('subdomain, custom_domain')
      .eq('id', pageId)
      .eq('user_id', userId)
      .single()

    const payload = {
      updated_at: new Date().toISOString(),
    } as any

    if (subdomain !== undefined) payload.subdomain = subdomain ? subdomain : null
    if (custom_domain !== undefined) payload.custom_domain = custom_domain ? custom_domain : null

    const { data: updatedPage, error } = await supabase
      .from('builder_pages')
      .update(payload)
      .eq('id', pageId)
      .eq('user_id', userId)
      .select('id, subdomain, custom_domain')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This domain or subdomain is already taken' }, { status: 400 })
      }
      throw new Error('Failed to update domain: ' + error.message)
    }

    // ── Vercel domain registration (only for custom domains) ──
    let vercelStatus: 'registered' | 'skipped' | 'error' = 'skipped'
    let vercelError: string | undefined

    if (custom_domain !== undefined) {
      const newDomain = custom_domain ? custom_domain.trim() : null
      const oldDomain = currentPage?.custom_domain || null

      // Remove old domain from Vercel if it changed
      if (oldDomain && oldDomain !== newDomain) {
        await removeDomainFromVercel(oldDomain)
      }

      // Register new domain on Vercel
      if (newDomain) {
        const result = await addDomainToVercel(newDomain)
        vercelStatus = result.ok ? 'registered' : 'error'
        vercelError = result.vercelError
      }
    }

    return NextResponse.json({
      success: true,
      page: updatedPage,
      vercel: { status: vercelStatus, error: vercelError },
    })

  } catch (error: any) {
    console.error('Domain update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

