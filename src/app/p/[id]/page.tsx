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
        .select('name, seo_title, seo_description, favicon_url')
        .eq('id', id)
        .single()

    if (!page) return { title: 'Page Not Found' }

    const title = page.seo_title || page.name || 'OfferIQ Page'
    const description = page.seo_description || 'An offer page powered by OfferIQ.'
    const faviconUrl = page.favicon_url || undefined

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
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
