"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setIsSent(true);
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
          <h2>Reset password</h2>
          <p className="oiq-subtitle">Enter your email address and we'll send you a link to reset your password.</p>

          <form onSubmit={handleReset} autoComplete="on">
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
                disabled={isSent}
              />
            </div>

            {/* Reset Button */}
            <button
              id="oiq-reset-btn"
              type="submit"
              className="oiq-signin-btn"
              disabled={isLoading || isSent}
              style={{ marginTop: "24px" }}
            >
              {isLoading ? (
                <>
                  <span className="oiq-spinner" />
                  Sending...
                </>
              ) : isSent ? (
                "Reset Link Sent!"
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {isSent && (
            <p className="oiq-signup-hint" style={{ marginTop: "16px", color: "#10b981" }}>
              Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </p>
          )}

          <p className="oiq-signup-hint" style={{ marginTop: "32px" }}>
            Remembered your password?{" "}
            <Link href="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
