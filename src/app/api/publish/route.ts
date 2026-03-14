import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { components, rootList, canvasStyle } = await req.json()
    const userId = session.user.id

    const supabase = createAdminClient()

    // 1. Ensure User has a Workspace
    let { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (!workspace) {
      const { data: newW, error } = await supabase.from('workspaces').insert({ user_id: userId, name: 'Default Workspace' }).select('id').single()
      if (error) throw new Error('Failed to create workspace')
      workspace = newW
    }

    // 2. Ensure User has an Offer
    let { data: offer } = await supabase
      .from('offers')
      .select('id')
      .eq('workspace_id', workspace.id)
      .limit(1)
      .single()

    if (!offer) {
      const { data: newO, error } = await supabase.from('offers').insert({ user_id: userId, workspace_id: workspace.id, name: 'Default Offer' }).select('id').single()
      if (error) throw new Error('Failed to create offer')
      offer = newO
    }

    // 3. Ensure User has a Funnel
    let { data: funnel } = await supabase
      .from('funnels')
      .select('id')
      .eq('offer_id', offer.id)
      .limit(1)
      .single()

    if (!funnel) {
      const { data: newF, error } = await supabase.from('funnels').insert({ user_id: userId, workspace_id: workspace.id, offer_id: offer.id, name: 'Default Funnel' }).select('id').single()
      if (error) throw new Error('Failed to create funnel')
      funnel = newF
    }

    // 4. Upsert the Funnel Page (Landing Page)
    // For simplicity, we create a single "Home" page per funnel in this standalone builder MVP
    const pageSlug = 'home'
    
    let { data: page } = await supabase
      .from('funnel_pages')
      .select('id')
      .eq('funnel_id', funnel.id)
      .eq('slug', pageSlug)
      .limit(1)
      .single()

    const payload = {
        funnel_id: funnel.id,
        name: 'Landing Page',
        slug: pageSlug,
        type: 'landing',
        blocks: { components, rootList, canvasStyle } // Store our nested Zustand tree beautifully!
    }

    let publishedPageId;

    if (!page) {
      const { data: newPage, error } = await supabase.from('funnel_pages').insert(payload).select('id').single()
      if (error) throw new Error('Failed to insert page: ' + error.message)
      publishedPageId = newPage.id
    } else {
      const { error } = await supabase.from('funnel_pages').update(payload).eq('id', page.id)
      if (error) throw new Error('Failed to update page: ' + error.message)
      publishedPageId = page.id
    }

    return NextResponse.json({ success: true, pageId: publishedPageId })

  } catch (error: any) {
    console.error('Publish error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
