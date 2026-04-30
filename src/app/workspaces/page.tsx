"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Workspace {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch("/api/workspaces");
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          console.error("Error fetching workspaces:", result.error);
          setWorkspaces([]);
        } else {
          setWorkspaces(result.workspaces || []);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        setWorkspaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p>Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Workspaces</h1>
            <p className="text-muted-foreground">
              Manage and access your OfferIQ workspaces
            </p>
          </div>
          <Link
            href="/onboard"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-yellow-400"
          >
            Create Workspace
          </Link>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-semibold mb-2">No workspaces yet</h2>
            <p className="text-slate-400 mb-6">
              Create your first workspace to get started with OfferIQ
            </p>
            <Link
              href="/onboard"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-yellow-400"
            >
              Create Your First Workspace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/workspaces/${workspace.id}`}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-yellow-300 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-300/10 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(workspace.created_at).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {workspace.name}
                </h3>
                {workspace.domain && (
                  <p className="text-slate-400 text-sm">
                    {workspace.domain}.offeriq.com
                  </p>
                )}
                <div className="mt-4 text-accent text-sm font-medium">
                  Open Workspace →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
