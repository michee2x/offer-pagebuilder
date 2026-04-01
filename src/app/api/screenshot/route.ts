import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'
import puppeteer from 'puppeteer-core'

export const maxDuration = 30; // Max edge function duration, although Vercel free tier might limit to 10s.

const IS_LOCAL = process.env.NODE_ENV === 'development'

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

    // ─── SERVERLESS PUPPETEER SCREENSHOT ENGINE ───
    let host = req.headers.get('host') || 'localhost:3000'
    // Ensure we hit the base app for the preview route without subdomain interference
    if (IS_LOCAL && host.includes('.localhost')) {
      host = 'localhost:3000'
    }
    const protocol = host.includes('localhost') ? 'http://' : 'https://'
    const targetUrl = `${protocol}${host}/p/${pageId}`

    let browser;
    try {
      if (IS_LOCAL) {
        // Fallback to local puppeteer for dev environment
        const localPuppeteer = require('puppeteer')
        browser = await localPuppeteer.launch({
          headless: true,
          defaultViewport: { width: 1200, height: 630 }
        })
      } else {
        // Vercel Serverless Headless Chromium Engine
        const sparticuz = require('@sparticuz/chromium')
        const chromium = sparticuz.default || sparticuz
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: { width: 1200, height: 630 },
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        })
      }

      const page = await browser.newPage()
      
      // Navigate to the raw page route
      // We use 'load' instead of 'networkidle0' because Next.js dev server HMR websockets keep the network busy.
      await page.goto(targetUrl, { waitUntil: 'load', timeout: 6000 })
      
      // Wait exactly 2.5 seconds for images/fonts to finish hydrating per plan
      await new Promise(r => setTimeout(r, 2500))

      const screenshotBuffer = await page.screenshot({ type: 'png' })
      
      await browser.close()
      
      // Upload the raw PNG blob into Supabase screenshots bucket
      const filename = `screenshot_${pageId}_${Date.now()}.png`
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, screenshotBuffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Upload to Supabase failed: ${uploadError.message}`)
      }

      const { data: publicUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filename)

      const finalOgUrl = publicUrlData.publicUrl

      // Update the record with our dynamic URL
      await persistOgImage(supabase, pageId, finalOgUrl)

      return NextResponse.json({ success: true, screenshotUrl: finalOgUrl })

    } catch (browserError) {
      if (browser) await browser.close().catch(() => {});
      console.warn('[OG] Serverless Puppeteer failed/timed out. Falling back to Satori:', browserError)

      // ─── FALLBACK: SATORI OG DYNAMIC GENERATOR ───
      const fallbackOgUrl = `/api/og?id=${pageId}`
      await persistOgImage(supabase, pageId, fallbackOgUrl)
      
      return NextResponse.json({ success: true, screenshotUrl: fallbackOgUrl, fallback: true })
    }

  } catch (error: any) {
    console.error('Screenshot API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function persistOgImage(supabase: any, pageId: string, ogUrl: string) {
    const { data: page } = await supabase
      .from('builder_pages')
      .select('blocks')
      .eq('id', pageId)
      .single()

    const { error: colErr } = await supabase
      .from('builder_pages')
      .update({ og_image_url: ogUrl, updated_at: new Date().toISOString() })
      .eq('id', pageId)

    if (colErr) {
      const updatedBlocks = { ...(page?.blocks || {}), og_image_url: ogUrl }
      await supabase
        .from('builder_pages')
        .update({ blocks: updatedBlocks, updated_at: new Date().toISOString() })
        .eq('id', pageId)
    }
}
