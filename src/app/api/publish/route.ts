import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { components, rootList, canvasStyle, pageId, name } = await req.json()
    const userId = session.user.id

    const supabase = createAdminClient()

    const payload = {
        user_id: userId,
        name: name || 'Untitled Page',
        blocks: { components, rootList, canvasStyle },
        updated_at: new Date().toISOString()
    }

    let publishedPageId;

    if (!pageId) {
      const { data: newPage, error } = await supabase.from('builder_pages').insert(payload).select('id').single()
      if (error) throw new Error('Failed to insert page: ' + error.message)
      publishedPageId = newPage.id
    } else {
      const { data: updatedPage, error } = await supabase.from('builder_pages').update(payload).eq('id', pageId).eq('user_id', userId).select('id').single()
      if (error) throw new Error('Failed to update page: ' + error.message)
      publishedPageId = updatedPage.id
    }

    return NextResponse.json({ success: true, pageId: publishedPageId })

  } catch (error: any) {
    console.error('Publish error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
