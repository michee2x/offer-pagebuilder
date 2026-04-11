"use client";

import Link from "next/link";
import { Plus, Layout, Folder, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteFunnelButton } from "@/components/DeleteFunnelButton";

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    builder_pages: Array<{
      id: string;
      name: string;
      updated_at: string;
      og_image_url?: string;
      blocks?: any;
    }>;
  };
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            {workspace.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {workspace.builder_pages?.length || 0} funnels
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Funnels in this workspace */}
        <div className="space-y-3">
          {workspace.builder_pages && workspace.builder_pages.length > 0 ? (
            workspace.builder_pages.slice(0, 3).map((funnel) => (
              <div
                key={funnel.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {funnel.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(funnel.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={
                      funnel.blocks?.intelligence?.call1_complete
                        ? `/intelligence/${funnel.id}`
                        : `/builder?id=${funnel.id}`
                    }
                  >
                    <Button variant="ghost" size="sm">
                      {funnel.blocks?.intelligence?.call1_complete
                        ? "View Report"
                        : "Edit"}
                    </Button>
                  </Link>
                  <DeleteFunnelButton
                    funnelId={funnel.id}
                    funnelName={funnel.name}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No funnels yet</p>
            </div>
          )}
        </div>

        {/* Create funnel button */}
        <Link href={`/onboard?workspace=${workspace.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Funnel
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
