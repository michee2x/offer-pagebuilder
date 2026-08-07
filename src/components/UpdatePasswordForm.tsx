"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function UpdatePasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setEmail(data.user.email);
      }
    });
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      
      // On success, redirect to dashboard or home
      alert("Password updated successfully!");
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
          <h2>Set new password</h2>
          <p className="oiq-subtitle">Please enter your new password below.</p>

          <form onSubmit={handleUpdate} autoComplete="on">
            {/* Hidden email field for password managers */}
            <input 
              type="email" 
              name="email"
              autoComplete="username" 
              value={email} 
              readOnly 
              style={{ display: 'none' }} 
              aria-hidden="true"
            />
            {/* New Password */}
            <label className="oiq-field-label" htmlFor="oiq-password">New Password</label>
            <div className="oiq-field-wrap oiq-pw-wrap">
              <input
                id="oiq-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
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
            <label className="oiq-field-label" htmlFor="oiq-confirm-password" style={{ marginTop: "16px" }}>Confirm Password</label>
            <div className="oiq-field-wrap oiq-pw-wrap">
              <input
                id="oiq-confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            {/* Update Button */}
            <button
              id="oiq-update-btn"
              type="submit"
              className="oiq-signin-btn"
              disabled={isLoading}
              style={{ marginTop: "24px" }}
            >
              {isLoading ? (
                <>
                  <span className="oiq-spinner" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
          
          <p className="oiq-signup-hint" style={{ marginTop: "32px" }}>
            <Link href="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
