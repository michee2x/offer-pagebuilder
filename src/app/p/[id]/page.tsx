import type { Metadata } from 'next'
import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { ViewerHydrator } from "@/components/builder/ViewerHydrator"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: page } = await supabase
        .from('builder_pages')
        .select('name, seo_title, seo_description, favicon_url, og_image_url, blocks')
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ofiq.app'
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

    return (
        <ViewerHydrator blocks={page.blocks} />
    )
}
