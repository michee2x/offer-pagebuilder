import type { Metadata } from 'next'
import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { ViewerHydrator } from "@/components/builder/ViewerHydrator"

type Props = { params: Promise<{ domain: string; path?: string[] }> }

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
    const { domain } = await params
    const { page } = await getPageByDomain(domain)

    if (!page) return { title: 'Page Not Found' }

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
            ? { icon: faviconUrl, shortcut: faviconUrl }
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
        let targetPage = page.blocks.pages[requestedPath];

        if (!targetPage) {
            return notFound();
        }
        // Pass only the specific target page's format into ViewerHydrator.
        hydratedBlocks = {
            ...page.blocks,
            components: targetPage.components,
            rootList: targetPage.rootList
        };
    } else if (requestedPath !== '/') {
        // Legacy single-page funnel shouldn't match subpaths
        return notFound();
    }

    return (
        <ViewerHydrator blocks={hydratedBlocks} />
    )
}
