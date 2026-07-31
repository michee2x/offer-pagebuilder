"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const [stage, setStage] = useState<"loading" | "set-password" | "done" | "error">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();

    // 1. Check for PKCE code in the URL (Newer Supabase Projects)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) {
          setStage("set-password");
          // Remove the code from the URL so it doesn't get exchanged again on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setStage("error");
        }
      });
      return;
    }

    // 2. Implicit Flow (Older Supabase Projects)
    // Supabase JS automatically reads the #access_token from the URL hash
    // and fires SIGNED_IN when it processes an invite link.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Always show set-password when landing on this page via an invite link
        setStage("set-password");
      }
    });

    // Also check if session is already set (hash already consumed on re-render)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStage("set-password");
      } else {
        // Wait 2.5s — if still no session after hash should be consumed, show error
        setTimeout(() => {
          setStage(prev => prev === "loading" ? "error" : prev);
        }, 2500);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setIsSubmitting(false);
      return;
    }

    setStage("done");
    setTimeout(() => {
      window.location.href = "/";
    }, 1800);
  };

  // Loading
  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold tracking-tight">Accepting invitation…</h2>
        <p className="text-gray-400 mt-2">Hang tight while we verify your link.</p>
      </div>
    );
  }

  // Done
  if (stage === "done") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <CheckCircle2 className="w-14 h-14 text-green-400 mb-4" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">You are all set!</h2>
        <p className="text-gray-400">Redirecting you to your workspace…</p>
      </div>
    );
  }

  // Error
  if (stage === "error") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white text-center px-4">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Invalid or expired invite link</h2>
        <p className="text-gray-400 mb-6">
          This invitation link may have already been used or has expired. Ask the workspace owner to resend the invite.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all"
        >
          Go to Home
        </a>
      </div>
    );
  }

  // Set password form
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vh] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 shadow-2xl">
          {/* Brand */}
          <div className="flex items-center justify-center mb-8">
            <span className="text-white font-bold text-2xl tracking-tight">OfferIQ</span>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Welcome to your workspace
          </h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            You have been invited! Set a password to activate your account.
          </p>

          <form onSubmit={handleSetPassword} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.08] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.08] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting password…
                </>
              ) : (
                "Activate Account →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
