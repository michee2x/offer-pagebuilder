import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId, seo_title, seo_description, favicon_url } = await req.json()
    const userId = session.user.id

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (seo_title !== undefined) payload.seo_title = seo_title || null
    if (seo_description !== undefined) payload.seo_description = seo_description || null
    if (favicon_url !== undefined) payload.favicon_url = favicon_url || null

    const { data: updatedPage, error } = await supabase
      .from('builder_pages')
      .update(payload)
      .eq('id', pageId)
      .eq('user_id', userId)
      .select('id, seo_title, seo_description, favicon_url')
      .single()

    if (error) {
      throw new Error('Failed to update SEO fields: ' + error.message)
    }

    return NextResponse.json({ success: true, page: updatedPage })

  } catch (error: any) {
    console.error('SEO update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
