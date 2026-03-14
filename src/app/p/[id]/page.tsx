import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { ViewerHydrator } from "@/components/builder/ViewerHydrator"

export default async function LiveViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createAdminClient()
    
    // Server fetch the published JSON tree
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
