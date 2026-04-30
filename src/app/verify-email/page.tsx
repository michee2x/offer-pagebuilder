"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export const runtime = "edge";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const hasError = Boolean(error);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }
    };
    getUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/onboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      if (!email) {
        alert("Please sign up again to resend the verification email.");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      alert("Verification email sent!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-layout">
      <div className="verify-glow"></div>
      <div className="verify-card">
        <div className="verify-icon">✉️</div>
        <h2>{hasError ? "Verification link issue" : "Check your email"}</h2>

        {hasError ? (
          <>
            <p style={{ marginBottom: 16 }}>
              The verification link you opened is invalid or expired.
            </p>
            <p style={{ color: "#f1c40f", marginBottom: 24 }}>
              {errorDescription ||
                "Please request a new verification email using the button below."}
            </p>
          </>
        ) : (
          <>
            <p>
              We&apos;ve sent a verification link to <strong>{email}</strong>
            </p>
            <div className="verify-email-box">{email}</div>
          </>
        )}

        <button
          type="button"
          className="btn-primary"
          onClick={handleResend}
          disabled={isResending}
          style={{ marginTop: 18 }}
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </button>

        {hasError && (
          <p style={{ marginTop: 20, color: "#cbd5e1", fontSize: 14 }}>
            If this keeps happening, try signing up again. Make sure you open
            the new link immediately in the same browser.
          </p>
        )}
      </div>
    </div>
  );
}
