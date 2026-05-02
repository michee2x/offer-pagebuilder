import { createClient } from "@/utils/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to get Supabase session:", error.message);
    return null;
  }

  return data.session;
}
