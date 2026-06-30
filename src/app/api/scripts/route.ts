import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId, custom_head_code, custom_body_code } = await req.json()
    const userId = session.user.id

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (custom_head_code !== undefined) payload.custom_head_code = custom_head_code || null
    if (custom_body_code !== undefined) payload.custom_body_code = custom_body_code || null

    const { data: updatedPage, error } = await supabase
      .from('builder_pages')
      .update(payload)
      .eq('id', pageId)
      .eq('user_id', userId)
      .select('id, custom_head_code, custom_body_code')
      .single()

    if (error) {
      throw new Error('Failed to update tracking scripts: ' + error.message)
    }

    return NextResponse.json({ success: true, page: updatedPage })

  } catch (error: any) {
    console.error('Scripts update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
