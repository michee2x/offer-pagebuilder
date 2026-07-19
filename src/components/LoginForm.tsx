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

          <p className="oiq-signup-hint">
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
