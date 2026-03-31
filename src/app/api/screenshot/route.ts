import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('screenshot') as Blob | null
    const pageId = formData.get('pageId') as string | null

    if (!file || !pageId) {
      return NextResponse.json({ error: 'Missing file or pageId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === 'screenshots')
    if (!bucketExists) {
        await supabase.storage.createBucket('screenshots', { public: true })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = `${session.user.id}/${pageId}/og-image.png`

    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      throw new Error('Upload failed: ' + uploadError.message)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath)

    // Append a timestamp to perfectly bust the browser cache!
    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

    // Update the database with the new URL
    const { data: page } = await supabase
      .from('builder_pages')
      .select('blocks')
      .eq('id', pageId)
      .single()

    const { error: colErr } = await supabase
      .from('builder_pages')
      .update({ og_image_url: cacheBustedUrl, updated_at: new Date().toISOString() } as any)
      .eq('id', pageId)

    if (colErr) {
      const updatedBlocks = { ...(page?.blocks || {}), og_image_url: cacheBustedUrl }
      await supabase
        .from('builder_pages')
        .update({ blocks: updatedBlocks, updated_at: new Date().toISOString() })
        .eq('id', pageId)
    }

    return NextResponse.json({ success: true, screenshotUrl: cacheBustedUrl })
  } catch (error: any) {
    console.error('Screenshot API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
