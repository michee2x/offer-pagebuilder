import type { Metadata, Viewport } from 'next'
import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { ServerLiveViewer } from "@/components/builder/ServerLiveViewer"
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker"
import { ScriptInjector } from "@/components/tracking/ScriptInjector"

type Props = { params: Promise<{ domain: string; path?: string[] }> }

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
}

async function getPageByDomain(domain: string) {
    const supabase = createAdminClient()
    const decodedDomain = decodeURIComponent(domain)

    const isLocalSubdomain = decodedDomain.endsWith('.localhost')
    const isProdSubdomain = decodedDomain.endsWith('.ofiq.app')

    let query
    if (isLocalSubdomain || isProdSubdomain) {
        const subdomain = decodedDomain.replace('.localhost', '').replace('.ofiq.app', '')
        query = supabase.from('builder_pages').select('*').eq('subdomain', subdomain).single()
    } else {
        query = supabase.from('builder_pages').select('*').eq('custom_domain', decodedDomain).single()
    }

    const { data: page, error } = await query
    return { page: error ? null : page }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { domain, path } = await params
    const { page } = await getPageByDomain(domain)

    if (!page) return { title: 'Page Not Found' }

    const requestedPath = path ? '/' + path.join('/') : '/'
    const title = page.seo_title || page.name || 'OfferIQ Page'
    const description = page.seo_description || 'An offer page powered by OfferIQ.'
    const faviconUrl = page.favicon_url || undefined

    const rawOgImage: string | undefined = 
        page.og_image_url || 
        (page.blocks as any)?.og_image_url || 
        undefined

    let protocol = 'https'
    const decodedDomain = decodeURIComponent(domain)
    if (decodedDomain.includes('localhost') || decodedDomain.includes('127.0.0.1')) {
        protocol = 'http'
    }

    const baseUrl = `${protocol}://${decodedDomain}`
    const canonicalUrl = `${baseUrl}${requestedPath === '/' ? '' : requestedPath}`
    const ogImage = rawOgImage 
        ? (rawOgImage.startsWith('http') ? rawOgImage : `${baseUrl}${rawOgImage}`)
        : undefined

    const ogImages = ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : []

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
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

export default async function LiveViewerPage({ params }: Props) {
    const { domain, path } = await params
    const { page } = await getPageByDomain(domain)

    if (!page || !page.blocks) {
        return notFound()
    }

    const requestedPath = path ? '/' + path.join('/') : '/';
    let hydratedBlocks = page.blocks;

    // Support new multi-page format
    if (page.blocks.pages) {
        const targetPage = page.blocks.pages[requestedPath];

        if (!targetPage) {
            return notFound();
        }
        // Pass only the specific target page's format and full pages dictionary into ViewerHydrator.
        hydratedBlocks = {
            ...page.blocks,
            components: targetPage.components || {},
            rootList: targetPage.rootList || [],
            pages: page.blocks.pages,
            activePagePath: requestedPath
        };
    } else if (requestedPath !== '/') {
        // Legacy single-page funnel shouldn't match subpaths
        return notFound();
    }

    const headCode: string = (page as any).custom_head_code || ''
    const bodyCode: string = (page as any).custom_body_code || ''

    hydratedBlocks.funnelId = page.id;

    // Generate JSON-LD Schema.org structured data for SEO
    const pageTitle = page.seo_title || page.name || 'OfferIQ Page'
    const pageDesc = page.seo_description || 'An offer page powered by OfferIQ.'
    const decodedDomain = decodeURIComponent(domain)
    const protocol = decodedDomain.includes('localhost') || decodedDomain.includes('127.0.0.1') ? 'http' : 'https'
    const pageUrl = `${protocol}://${decodedDomain}${requestedPath === '/' ? '' : requestedPath}`

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description: pageDesc,
        url: pageUrl,
        publisher: {
            '@type': 'Organization',
            name: 'OfferIQ',
            url: 'https://www.ofiq.app',
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ScriptInjector headCode={headCode} bodyCode={bodyCode} />
            <AnalyticsTracker pageId={page.id} pagePath={requestedPath} />
            <ServerLiveViewer blocks={hydratedBlocks} />
        </>
    )
}
