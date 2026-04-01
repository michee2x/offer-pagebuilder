import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId } = await req.json()
    if (!pageId) {
      return NextResponse.json({ error: 'Missing pageId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // ─── SATORI OG DYNAMIC GENERATOR ───
    // Instead of using heavy puppeteer or broken client-side captures,
    // we use a dynamic Next.js API route that generates a beautiful card on-the-fly.
    // Ensure we point it to absolute URL if hitting it via social platforms
    
    const ogUrl = `/api/og?id=${pageId}`

    // Update the record with our dynamic URL so the dashboard and success page know about it
    const { data: page } = await supabase
      .from('builder_pages')
      .select('blocks')
      .eq('id', pageId)
      .single()

    const { error: colErr } = await supabase
      .from('builder_pages')
      .update({ og_image_url: ogUrl, updated_at: new Date().toISOString() } as any)
      .eq('id', pageId)

    if (colErr) {
      const updatedBlocks = { ...(page?.blocks || {}), og_image_url: ogUrl }
      await supabase
        .from('builder_pages')
        .update({ blocks: updatedBlocks, updated_at: new Date().toISOString() })
        .eq('id', pageId)
    }

    return NextResponse.json({ success: true, screenshotUrl: ogUrl })
  } catch (error: any) {
    console.error('Screenshot API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
