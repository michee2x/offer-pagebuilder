"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Listen for auth state changes which parses the implicit flow tokens
    // from the URL hash and sets the session cookies automatically.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/");
      }
    });

    // Also check immediately in case the session is already established
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <h2 className="text-xl font-semibold tracking-tight">Authenticating...</h2>
      <p className="text-gray-400 mt-2">Please wait while we log you in.</p>
    </div>
  );
}
