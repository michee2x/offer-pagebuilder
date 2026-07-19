"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useUIStore } from "@/store/uiStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function WorkspaceSwitcher({
  workspaces,
  activeId,
}: {
  workspaces: any[];
  activeId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeWorkspaceId, setActiveWorkspaceId } = useUIStore();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const urlWorkspace = searchParams.get("workspace");

    if (urlWorkspace) {
      if (urlWorkspace !== activeWorkspaceId) {
        setActiveWorkspaceId(urlWorkspace);
      }
    } else {
      if (activeWorkspaceId) {
        const exists = workspaces?.some((w) => w.id === activeWorkspaceId);
        if (exists && activeWorkspaceId !== activeId) {
          router.replace(`/?workspace=${activeWorkspaceId}`);
        } else if (!exists) {
          if (activeId) {
            setActiveWorkspaceId(activeId);
          }
        }
      } else {
        if (activeId) {
          setActiveWorkspaceId(activeId);
        }
      }
    }
  }, [activeId, activeWorkspaceId, setActiveWorkspaceId, searchParams, workspaces, router]);

  if (!workspaces || workspaces.length === 0) return null;

  return (
    <div className="mr-2">
      <Select
        value={activeWorkspaceId || activeId || ""}
        onValueChange={(val) => {
          if (val === "create-workspace") {
            startTransition(() => {
              router.push("/onboard");
            });
            return;
          }
          if (val === "manage-workspace") {
            startTransition(() => {
              router.push("/workspaces");
            });
            return;
          }
          setActiveWorkspaceId(val);
          startTransition(() => {
            router.push(`/?workspace=${val}`);
            router.refresh();
          });
        }}
        disabled={isPending}
      >
        <SelectTrigger className="min-w-[190px] h-10 rounded-full border border-border bg-muted/10 px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/20">
          <div className="flex items-center gap-2">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <SelectValue placeholder="Workspace" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-border bg-background shadow-xl">
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
          <SelectItem
            value="create-workspace"
            className="text-primary border-t border-border/50 pt-2"
          >
            + Add workspace
          </SelectItem>
          <SelectItem
            value="manage-workspace"
            className="text-muted-foreground"
          >
            Manage workspace
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
