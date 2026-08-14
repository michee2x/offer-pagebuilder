import type { Metadata } from 'next'
import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { ServerLiveViewer } from "@/components/builder/ServerLiveViewer"
import { headers } from "next/headers"
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker"
import { ScriptInjector } from "@/components/tracking/ScriptInjector"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: page } = await supabase
        .from('builder_pages')
        .select('name, seo_title, seo_description, favicon_url, og_image_url, blocks, custom_head_code, custom_body_code')
        .eq('id', id)
        .single()

    if (!page) return { title: 'Page Not Found' }

    const title       = page.seo_title       || page.name        || 'OfferIQ Page'
    const description = page.seo_description || 'An offer page powered by OfferIQ.'
    const faviconUrl  = page.favicon_url      || undefined

    // Resolve og:image — top-level column preferred, fall back to blocks JSON
    const rawOgImage: string | undefined =
        page.og_image_url ||
        (page.blocks as any)?.og_image_url ||
        undefined

    const headersList = await headers()
    const host = headersList.get('host') || 'ofiq.app'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    
    // Dynamically lock onto whatever domain the crawler is attacking 
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    const ogImage = rawOgImage 
        ? (rawOgImage.startsWith('http') ? rawOgImage : `${baseUrl}${rawOgImage}`)
        : undefined

    const ogImages = ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : []

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: ogImages,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : [],
        },
        icons: faviconUrl
            ? { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl }
            : undefined,
    }
}

/**
 * Determine whether the OfferIQ branding badge should be shown on this page.
 * Plans that get branding: free, starter.
 * Plans that are branding-free: growth, agency.
 * Falls back to showing branding if the plan cannot be determined (safe default).
 */
async function resolveShowBranding(pageId: string): Promise<boolean> {
    const supabase = createAdminClient()

    try {
        // builder_pages → funnels → workspaces → users (plan)
        // builder_pages.id = funnel id for pages created by the builder
        const { data: funnel } = await supabase
            .from('funnels')
            .select('workspace_id')
            .eq('id', pageId)
            .single()

        if (!funnel?.workspace_id) return true // can't resolve → show branding

        const { data: workspace } = await supabase
            .from('workspaces')
            .select('user_id')
            .eq('id', funnel.workspace_id)
            .single()

        if (!workspace?.user_id) return true

        const { data: user } = await supabase
            .from('users')
            .select('plan')
            .eq('id', workspace.user_id)
            .single()

        const plan = (user?.plan || 'free').toLowerCase()
        // Agency and Growth = no branding badge; everything else = show badge
        return plan !== 'agency' && plan !== 'growth'
    } catch {
        return true // safe fallback: show branding
    }
}

export default async function LiveViewerPage({ params }: Props) {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: page, error } = await supabase
        .from('builder_pages')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !page || !page.blocks) {
        return notFound()
    }

    const headCode: string = (page as any).custom_head_code || ''
    const bodyCode: string = (page as any).custom_body_code || ''

    // Resolve branding visibility based on page owner's plan
    const showBranding = await resolveShowBranding(id)

    return (
        <>
            <ScriptInjector headCode={headCode} bodyCode={bodyCode} />
            <AnalyticsTracker pageId={id} pagePath="/" />
            <ServerLiveViewer blocks={page.blocks} showBranding={showBranding} />
        </>
    )
}

