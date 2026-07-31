"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, MailOpen } from "lucide-react";

function ConfirmInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as any;

  // If there's no token_hash in the URL, redirect to home
  useEffect(() => {
    if (!token_hash) {
      router.push("/");
    }
  }, [token_hash, router]);

  const handleAccept = async () => {
    if (!token_hash) return;
    setIsVerifying(true);
    setErrorMsg("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type || "invite",
    });

    if (error) {
      setErrorMsg(error.message);
      setIsVerifying(false);
    } else {
      // Session is successfully established!
      // Redirect to the invite page where they will be prompted to set their password.
      router.push("/auth/invite");
    }
  };

  if (!token_hash) return null;

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 shadow-2xl text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
            <MailOpen className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          You've been invited!
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Click the button below to securely accept your invitation and join the workspace.
        </p>

        {errorMsg && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={isVerifying}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Accept Invitation"
          )}
        </button>
      </div>
    </div>
  );
}

export default function ConfirmInvitePage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vh] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-blue-500 relative z-10" />}>
        <ConfirmInviteContent />
      </Suspense>
    </div>
  );
}
