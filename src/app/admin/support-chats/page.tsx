import { createAdminClient } from "@/utils/supabase/admin";
import { getUser } from "@/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "../AdminNav";
import { MessageSquare, AlertTriangle, ThumbsUp, ThumbsDown, Search, Mail, Sparkles } from "lucide-react";

export const metadata = {
  title: "Support Chat Reports | OfferIQ Admin",
};

interface SupportLog {
  id: string;
  created_at: string;
  user_email: string | null;
  user_message: string;
  bot_response: string;
  escalated: boolean;
  rating: "helpful" | "unhelpful" | null;
}

export default async function SupportChatsAdminPage(props: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q = "", filter = "all" } = await props.searchParams;

  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();

  // Verify admin role
  const { data: dbUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (dbUser?.role !== "admin") {
    redirect("/");
  }

  // Fetch logs
  let query = supabase
    .from("support_chat_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter === "escalated") {
    query = query.eq("escalated", true);
  } else if (filter === "unhelpful") {
    query = query.eq("rating", "unhelpful");
  } else if (filter === "helpful") {
    query = query.eq("rating", "helpful");
  }

  if (q) {
    query = query.ilike("user_message", `%${q}%`);
  }

  const { data: logsData } = await query;
  const logs: SupportLog[] = logsData || [];

  // Metrics overview
  const { count: totalCount } = await supabase
    .from("support_chat_logs")
    .select("*", { count: "exact", head: true });

  const { count: escalatedCount } = await supabase
    .from("support_chat_logs")
    .select("*", { count: "exact", head: true })
    .eq("escalated", true);

  const { count: helpfulCount } = await supabase
    .from("support_chat_logs")
    .select("*", { count: "exact", head: true })
    .eq("rating", "helpful");

  const { count: unhelpfulCount } = await supabase
    .from("support_chat_logs")
    .select("*", { count: "exact", head: true })
    .eq("rating", "unhelpful");

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <AdminNav />

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-brand-blue" />
            Support Chat Intelligence &amp; Reports
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Analyze AI chatbot conversations, identify unanswered questions, and monitor user satisfaction.
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#131826] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-white/40 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total AI Conversations</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-black text-white">{totalCount || 0}</p>
            <p className="text-[11px] text-white/30 mt-1">Logged questions answered by bot</p>
          </div>

          <div className="bg-[#131826] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-amber-400/80 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">Human Escalations</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-amber-400">{escalatedCount || 0}</p>
            <p className="text-[11px] text-white/30 mt-1">Questions referred to support@ofiq.app</p>
          </div>

          <div className="bg-[#131826] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-emerald-400/80 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">Helpful Ratings</span>
              <ThumbsUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">{helpfulCount || 0}</p>
            <p className="text-[11px] text-white/30 mt-1">Rated positive by users</p>
          </div>

          <div className="bg-[#131826] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-rose-400/80 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">Unhelpful Ratings</span>
              <ThumbsDown className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400">{unhelpfulCount || 0}</p>
            <p className="text-[11px] text-white/30 mt-1">Needs knowledge base expansion</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#131826] border border-white/10 rounded-2xl p-4">
          <form method="GET" className="flex items-center gap-2 w-full md:w-96 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search user questions..."
              className="bg-transparent border-none text-xs text-white placeholder-white/30 outline-none w-full"
            />
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "All Chats" },
              { id: "escalated", label: "Escalated to Support 🚨" },
              { id: "unhelpful", label: "Rated Unhelpful 👎" },
              { id: "helpful", label: "Rated Helpful 👍" },
            ].map((f) => (
              <a
                key={f.id}
                href={`/admin/support-chats?filter=${f.id}${q ? `&q=${q}` : ""}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === f.id
                    ? "bg-brand-blue text-white shadow-md shadow-blue-500/20"
                    : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                }`}
              >
                {f.label}
              </a>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Conversation Log Feed</h2>
            <span className="text-xs text-white/40">Showing latest {logs.length} entries</span>
          </div>

          <div className="divide-y divide-white/5">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-white/30 text-sm">
                No support chat logs found matching your criteria.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-5 hover:bg-white/[0.02] transition-colors space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white/50">{new Date(log.created_at).toLocaleString()}</span>
                      {log.user_email && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
                          {log.user_email}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {log.escalated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          <Mail className="w-3 h-3" /> Escalated to Email
                        </span>
                      )}
                      {log.rating === "helpful" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <ThumbsUp className="w-3 h-3" /> Helpful
                        </span>
                      )}
                      {log.rating === "unhelpful" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                          <ThumbsDown className="w-3 h-3" /> Unhelpful
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question & Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
                      <p className="font-bold text-white/50 uppercase tracking-wider text-[10px]">User Asked:</p>
                      <p className="text-white/90 font-medium leading-relaxed">{log.user_message}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1">
                      <p className="font-bold text-brand-blue uppercase tracking-wider text-[10px]">AI Responded:</p>
                      <p className="text-white/75 leading-relaxed line-clamp-4">{log.bot_response}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

