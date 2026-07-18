"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="oiq-login-card">

      {/* ── LEFT PANEL — transparent window into the fixed wave background ── */}
      <div className="oiq-left-panel">

        <div className="oiq-left-content">
          <div className="oiq-eyebrow">
            <span>OFFER INTELLIGENCE</span>
            <span className="oiq-eyebrow-line" />
          </div>

          <div className="oiq-headline-block">
            <h1>Turn any idea into a converting offer.</h1>
            <p>Strategy, copy, pages, and a traffic plan — built in one session, not six months.</p>
          </div>

          <div className="oiq-trust-row">
            <span className="oiq-trust-pill">✓ 30-day guarantee</span>
            <span className="oiq-trust-pill">✓ No design skills needed</span>
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
          <h2>Welcome back</h2>
          <p className="oiq-subtitle">Enter your credentials to access your account</p>

          <form onSubmit={handleLogin} autoComplete="on">
            {/* Email */}
            <label className="oiq-field-label" htmlFor="oiq-email">Email</label>
            <div className="oiq-field-wrap">
              <input
                id="oiq-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <label className="oiq-field-label" htmlFor="oiq-password">Password</label>
            <div className="oiq-field-wrap oiq-pw-wrap">
              <input
                id="oiq-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

            {/* Remember + Forgot */}
            <div className="oiq-row-between">
              <label className="oiq-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="oiq-forgot">Forgot password?</Link>
            </div>

            {/* Sign In */}
            <button
              id="oiq-signin-btn"
              type="submit"
              className="oiq-signin-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="oiq-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="oiq-divider"><span>or</span></div>

          {/* Google */}
          <button
            id="oiq-google-btn"
            type="button"
            className="oiq-google-btn"
            onClick={handleGoogleLogin}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="oiq-signup-hint">
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign up free</Link>
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
