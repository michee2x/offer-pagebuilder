"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setIsSent(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'recovery',
      });
      if (error) throw error;
      
      // OTP verified, session is established. Redirect to update password page.
      router.push("/update-password");
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
          {!isSent ? (
            <>
              <h2>Reset password</h2>
              <p className="oiq-subtitle">Enter your email address and we'll send you an 8-digit code to reset your password.</p>

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
                    disabled={isLoading}
                  />
                </div>

                {/* Reset Button */}
                <button
                  id="oiq-reset-btn"
                  type="submit"
                  className="oiq-signin-btn"
                  disabled={isLoading}
                  style={{ marginTop: "24px" }}
                >
                  {isLoading ? (
                    <>
                      <span className="oiq-spinner" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Enter Code</h2>
              <p className="oiq-subtitle">We sent an 8-digit code to <strong>{email}</strong>. Please enter it below.</p>

              <form onSubmit={handleVerifyOtp} autoComplete="off">
                {/* OTP Code */}
                <label className="oiq-field-label" htmlFor="oiq-otp">8-Digit Code</label>
                <div className="oiq-field-wrap">
                  <input
                    id="oiq-otp"
                    type="text"
                    placeholder="12345678"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    maxLength={8}
                    disabled={isLoading}
                    style={{ letterSpacing: "4px", textAlign: "center", fontSize: "18px", fontWeight: "bold" }}
                  />
                </div>

                {/* Verify Button */}
                <button
                  id="oiq-verify-btn"
                  type="submit"
                  className="oiq-signin-btn"
                  disabled={isLoading || otpCode.length < 8}
                  style={{ marginTop: "24px" }}
                >
                  {isLoading ? (
                    <>
                      <span className="oiq-spinner" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>
              
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "14px", textDecoration: "underline" }}
                >
                  Use a different email
                </button>
              </div>
            </>
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
