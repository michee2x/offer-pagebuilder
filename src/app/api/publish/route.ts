import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { components, rootList, canvasStyle, theme, pageId, name, pages } = await req.json()
    const userId = session.user.id

    const supabase = createAdminClient()

    let existingPage = null;
    let existingBlocks = {}
    if (pageId) {
      const { data: current } = await supabase.from('builder_pages').select('*').eq('id', pageId).single()
      if (current) {
        existingPage = current;
        if (current.blocks) {
          existingBlocks = current.blocks
        }
      }
    }

    const payload = {
      user_id: userId,
      name: name || 'Untitled Page',
      blocks: {
        ...existingBlocks,
        components,
        rootList,
        canvasStyle,
        theme,
        pages
      },
      updated_at: new Date().toISOString()
    }

    let publishedPageId;

    if (!pageId || !existingPage) {
      const { data: newPage, error } = await supabase.from('builder_pages').insert(payload).select('id')
      if (error) throw new Error('Failed to insert page: ' + error.message)
      if (!newPage || newPage.length === 0) throw new Error('Failed to insert page: Unknown error')
      publishedPageId = newPage[0].id
    } else if (existingPage.user_id !== userId || existingPage.is_template) {
      // Auto-clone if user doesn't own it or if it's a template
      const clonePayload = {
        ...payload,
        name: existingPage.name ? `${existingPage.name} (Copy)` : 'Untitled Page',
        workspace_id: existingPage.workspace_id,
        is_template: false,
      };
      const { data: clonedPage, error } = await supabase.from('builder_pages').insert(clonePayload).select('id')
      if (error) throw new Error('Failed to auto-clone page: ' + error.message)
      if (!clonedPage || clonedPage.length === 0) throw new Error('Failed to auto-clone page: Unknown error')
      publishedPageId = clonedPage[0].id
    } else {
      const { data: updatedPage, error } = await supabase.from('builder_pages').update(payload).eq('id', pageId).eq('user_id', userId).select('id')
      if (error) throw new Error('Failed to update page: ' + error.message)
      if (!updatedPage || updatedPage.length === 0) {
        throw new Error('Failed to update page: Page not found or you do not have permission to edit it.')
      }
      publishedPageId = updatedPage[0].id
    }

    return NextResponse.json({ success: true, pageId: publishedPageId })

  } catch (error: any) {
    console.error('Publish error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
