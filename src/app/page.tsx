import { getSession } from "@/auth"
import { createAdminClient } from "@/utils/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Layout } from "lucide-react"

export default async function DashboardPage() {
    const session = await getSession()
    if (!session || !session.user?.id) {
        redirect('/login')
    }

    const supabase = createAdminClient()
    const { data: pages, error } = await supabase
        .from('builder_pages')
        .select('id, name, updated_at')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

    // Optional error silently handled by showing 0 pages as MVP

    return (
        <div className="min-h-screen bg-muted/20 p-8">
            <div className="max-w-6xl flex flex-col mx-auto space-y-8 mt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Your Pages</h1>
                        <p className="text-muted-foreground mt-1">Manage and edit your OfferIQ generated pages.</p>
                    </div>
                    <Link href="/builder" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Page
                    </Link>
                </div>

                {(!pages || pages.length === 0) ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-16 text-center bg-background shadow-sm">
                        <Layout className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No pages yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">You haven't generated any pages. Start building with AI.</p>
                        <Link href="/builder" className="text-sm font-medium text-blue-500 hover:underline">Create your first page</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {pages.map((page: any) => (
                            <Link key={page.id} href={`/builder?id=${page.id}`} className="group relative block overflow-hidden rounded-xl border bg-background text-card-foreground shadow-sm hover:ring-2 hover:ring-primary hover:shadow-md transition-all">
                                <div className="aspect-[16/10] bg-muted/50 flex flex-col items-center justify-center border-b group-hover:bg-muted/80 transition-colors">
                                    <Layout className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold truncate">{page.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Updated {new Date(page.updated_at).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
