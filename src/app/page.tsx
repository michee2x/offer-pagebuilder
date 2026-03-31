import { getSession } from "@/auth"
import { createAdminClient } from "@/utils/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Layout } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

export default async function DashboardPage() {
    const session = await getSession()
    if (!session || !session.user?.id) {
        redirect('/login')
    }

    const supabase = createAdminClient()
    const { data: pages, error } = await supabase
        .from('builder_pages')
        .select('id, name, updated_at, og_image_url, blocks')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

    // Optional error silently handled by showing 0 pages as MVP

    return (
        <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        {/* ml-14 offsets the fixed sidebar's icon strip */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
                <Topbar 
                    breadcrumbs={[
                        { label: 'Workspace' },
                        { label: 'Funnels' }
                    ]}
                >
                    <button className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors relative">
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer">
                        SC
                    </div>
                </Topbar>
                
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto flex flex-col space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-heading font-bold tracking-tight">Your Funnels</h1>
                                <p className="text-muted-foreground mt-1 text-sm">Manage and edit your OfferIQ generated pages.</p>
                            </div>
                            <Link href="/builder" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-black hover:bg-primary/90 hover:shadow-[0_4px_14px_rgba(245,166,35,0.28)] h-8 px-4 py-2">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Create New Funnel
                            </Link>
                        </div>

                        {(!pages || pages.length === 0) ? (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-16 text-center bg-card shadow-sm">
                                <Layout className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-base font-semibold text-foreground">No funnels yet</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-6">You haven't generated any pages. Start building with AI.</p>
                                <Link href="/builder" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Create your first funnel →</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {pages.map((page: any) => (
                                    <Link key={page.id} href={`/builder?id=${page.id}`} className="group relative block overflow-hidden rounded-xl border border-border bg-card text-card-foreground hover:border-border/80 hover:shadow-lg transition-all hover:-translate-y-0.5">
                                        {(() => {
                                            const ogImg = page.og_image_url || page.blocks?.og_image_url || null;
                                            return ogImg ? (
                                                <div className="aspect-[16/10] overflow-hidden border-b border-border relative">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={ogImg}
                                                        alt={page.name}
                                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                            ) : (
                                                <div className="aspect-[16/10] bg-muted/30 flex flex-col items-center justify-center border-b border-border group-hover:bg-muted/50 transition-colors relative">
                                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <Layout className="w-7 h-7 text-muted-foreground/40 group-hover:text-primary/60 transition-colors relative z-10" />
                                                </div>
                                            );
                                        })()}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h3 className="font-semibold text-sm truncate">{page.name}</h3>
                                                <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" title="Published" />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">Updated {new Date(page.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
