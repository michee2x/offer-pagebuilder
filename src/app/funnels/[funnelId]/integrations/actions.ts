"use server";

import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveIntegrations(
  funnelId: string,
  makeWebhookUrl: string,
  zapierWebhookUrl: string,
  checkoutUrls?: Record<string, string>,
) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();

  // Fetch current blocks to preserve other data
  const { data: funnel } = await supabase
    .from("builder_pages")
    .select("blocks")
    .eq("id", funnelId)
    .eq("user_id", session.user.id)
    .single();

  if (!funnel) throw new Error("Funnel not found");

  const blocks = funnel.blocks || {};
  blocks.integrations = {
    ...(blocks.integrations || {}),
    makeWebhookUrl: makeWebhookUrl.trim(),
    zapierWebhookUrl: zapierWebhookUrl.trim(),
    checkoutUrls: checkoutUrls || blocks.integrations?.checkoutUrls || {},
  };

  const { error } = await supabase
    .from("builder_pages")
    .update({ blocks })
    .eq("id", funnelId)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/funnels/${funnelId}/integrations`);
  return { success: true };
}

export async function savePaymentIntegrations(
  workspaceId: string,
  integrations: { gateway: string; credentials: any; isLive: boolean }[]
) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();

  // Validate the user has access to this workspace
  const { data: member } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", session.user.id)
    .single();

  if (!member) throw new Error("Unauthorized access to workspace");

  for (const integration of integrations) {
    const { error } = await supabase
      .from("payment_integrations")
      .upsert({
        workspace_id: workspaceId,
        gateway: integration.gateway,
        credentials: integration.credentials,
        is_live: integration.isLive
      }, { onConflict: "workspace_id, gateway" });

    if (error) throw new Error(`Failed to save ${integration.gateway}: ${error.message}`);
  }

  return { success: true };
}
