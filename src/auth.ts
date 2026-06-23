import { createClient } from "@/utils/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  // Return a mock session object with the user to keep compatibility
  return { user: data.user };
}

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get Supabase user:", error.message);
    return null;
  }

  return data.user;
}
