import { createAdminClient } from "@/utils/supabase/admin"
import { notFound } from "next/navigation"
import { ViewerHydrator } from "@/components/builder/ViewerHydrator"

export default async function LiveViewerPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const supabase = createAdminClient()
    
    const decodedDomain = decodeURIComponent(domain);
    
    // Check if this domain is a subdomain of our base domains
    const isLocalSubdomain = decodedDomain.endsWith('.localhost');
    const isProdSubdomain = decodedDomain.endsWith('.ofiq.app');
    
    let query;
    if (isLocalSubdomain || isProdSubdomain) {
        const subdomain = decodedDomain.replace('.localhost', '').replace('.ofiq.app', '');
        query = supabase.from('builder_pages').select('*').eq('subdomain', subdomain).single();
    } else {
        query = supabase.from('builder_pages').select('*').eq('custom_domain', decodedDomain).single();
    }

    const { data: page, error } = await query;

    if (error || !page || !page.blocks) {
        return notFound()
    }

    return (
        <ViewerHydrator blocks={page.blocks} />
    )
}
