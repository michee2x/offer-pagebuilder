"use client";

import React, { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isLocalhost =
    typeof window !== "undefined" &&
    window.location.hostname.includes("localhost");
  const recaptchaSiteKey = isLocalhost
    ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_LOCALHOST
    : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!!recaptchaSiteKey && !captchaToken) {
      alert("Please complete the captcha");
      return;
    }
    setIsLoading(true);
    try {
      if (!!recaptchaSiteKey) {
        const verifyResponse = await fetch("/api/recaptcha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: captchaToken }),
        });
        const verifyResult = await verifyResponse.json();
        if (!verifyResponse.ok || !verifyResult.success) {
          captchaRef.current?.reset();
          setCaptchaToken(null);
          const details = verifyResult.details
            ? ` (${JSON.stringify(verifyResult.details)})`
            : "";
          throw new Error(
            verifyResult.error
              ? `${verifyResult.error}${details}`
              : `Captcha verification failed${details}`
          );
        }
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: { name: fullName },
        },
      });
      if (error) throw error;
      router.push("/verify-email");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboard`,
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="oiq-login-card">

      {/* ── LEFT PANEL — same fixed background as login ── */}
      <div className="oiq-left-panel">
        <div className="oiq-left-content">
          <div className="oiq-eyebrow">
            <span>OFFER INTELLIGENCE</span>
            <span className="oiq-eyebrow-line" />
          </div>

          <div className="oiq-headline-block">
            <h1>Your first offer is one session away.</h1>
            <p>Strategy, copy, pages, and a traffic plan — all generated for you in minutes, not months.</p>
          </div>

          <div className="oiq-trust-row">
            <span className="oiq-trust-pill">✓ Free to start</span>
            <span className="oiq-trust-pill">✓ No credit card required</span>
            <span className="oiq-trust-pill">✓ 30-day guarantee</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="oiq-right-panel">

        {/* Brand */}
        <div className="oiq-brand">
          <div className="oiq-brand-mark" />
          <span>OfferIQ</span>
        </div>

        <div className="oiq-form-wrap">
          <h2>Create your account</h2>
          <p className="oiq-subtitle">Start building converting offers today — free</p>

          <form onSubmit={handleSignup} autoComplete="on">

            {/* Full Name */}
            <label className="oiq-field-label" htmlFor="oiq-fullname">Full Name</label>
            <div className="oiq-field-wrap">
              <input
                id="oiq-fullname"
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <label className="oiq-field-label" htmlFor="oiq-signup-email">Email</label>
            <div className="oiq-field-wrap">
              <input
                id="oiq-signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <label className="oiq-field-label" htmlFor="oiq-signup-password">Password</label>
            <div className="oiq-field-wrap oiq-pw-wrap">
              <input
                id="oiq-signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                className="oiq-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <label className="oiq-field-label" htmlFor="oiq-confirm-password">Confirm Password</label>
            <div className="oiq-field-wrap oiq-pw-wrap">
              <input
                id="oiq-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                className="oiq-pw-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* ReCAPTCHA */}
            {recaptchaSiteKey && (
              <div style={{ marginBottom: "16px" }}>
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={recaptchaSiteKey}
                  onChange={setCaptchaToken}
                />
              </div>
            )}

            {/* Submit */}
            <button
              id="oiq-signup-btn"
              type="submit"
              className="oiq-signin-btn"
              disabled={isLoading || (!!recaptchaSiteKey && !captchaToken)}
            >
              {isLoading ? (
                <>
                  <span className="oiq-spinner" />
                  Creating account…
                </>
              ) : (
                "Get Started Free →"
              )}
            </button>
          </form>

          <div className="oiq-divider"><span>or</span></div>

          {/* Google */}
          <button
            id="oiq-google-signup-btn"
            type="button"
            className="oiq-google-btn"
            onClick={handleGoogleSignup}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="oiq-signup-hint">
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "16px", lineHeight: 1.5 }}>
            By signing up you agree to our{" "}
            <a href="#" style={{ color: "#6d3bf5", textDecoration: "none" }}>Terms of Service</a>
            {" "}and{" "}
            <a href="#" style={{ color: "#6d3bf5", textDecoration: "none" }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.3 35.3 26.8 36 24 36c-5.4 0-9.9-3.4-11.5-8.2l-6.6 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.3-5.4 6.9l6.3 5.3C39.8 37.4 44 31.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
