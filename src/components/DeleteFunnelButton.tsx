"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteFunnelButtonProps {
  funnelId: string;
  funnelName: string;
}

export function DeleteFunnelButton({
  funnelId,
  funnelName,
}: DeleteFunnelButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${funnelName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/funnels/${funnelId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete funnel");
      }

      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error("Error deleting funnel:", error);
      alert("Failed to delete funnel. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
