"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WorkspaceSwitcher({
  workspaces,
  activeId,
}: {
  workspaces: any[];
  activeId: string | null;
}) {
  const router = useRouter();

  if (!workspaces || workspaces.length === 0) return null;

  return (
    <div className="mr-2">
      <Select
        value={activeId || ""}
        onValueChange={(val) => {
          if (val === "create-workspace") {
            router.push("/onboard");
            return;
          }
          router.push(`/?workspace=${val}`);
        }}
      >
        <SelectTrigger className="min-w-[190px] h-10 rounded-full border border-border bg-muted/10 px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/20">
          <SelectValue placeholder="Workspace" />
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
        </SelectContent>
      </Select>
    </div>
  );
}
