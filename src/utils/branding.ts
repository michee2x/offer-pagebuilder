import { createAdminClient } from "@/utils/supabase/admin"

/**
 * Determine whether the OfferIQ branding badge should be shown on this page.
 * Plans that get branding: free, starter.
 * Plans that are branding-free: growth, agency.
 * Falls back to showing branding if the plan cannot be determined (safe default).
 */
export async function resolveShowBranding(pageId: string): Promise<boolean> {
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
