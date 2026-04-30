"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const captchaRef = useRef<ReCAPTCHA | null>(null);
  const router = useRouter();
  const isLocalhost =
    typeof window !== "undefined" &&
    window.location.hostname.includes("localhost");
  const recaptchaSiteKey = isLocalhost
    ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_LOCALHOST!
    : process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert("Please complete the captcha");
      return;
    }
    setIsLoading(true);
    try {
      const verifyResponse = await fetch("/api/recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
            : `Captcha verification failed${details}`,
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            name,
            role,
          },
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

  const selectRole = (selectedRole: string) => {
    setRole(selectedRole);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Join OfferIQ</h1>
          <p>Create your account and start building AI-powered pages</p>
        </div>

        <button className="btn-google" onClick={handleGoogleSignup}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <div></div>
          <span>or</span>
          <div></div>
        </div>

        <form onSubmit={handleSignup}>
          <div className="field-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="field-group">
            <label>What best describes you?</label>
            <div className="role-grid">
              {[
                "Agency",
                "🏢 SaaS",
                "🎨 Creator",
                "📈 Affiliate",
                "🏪 Local Biz",
              ].map((r) => (
                <div
                  key={r}
                  className={`role-chip ${role === r ? "selected" : ""}`}
                  onClick={() => selectRole(r)}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>

          <ReCAPTCHA
            ref={captchaRef}
            sitekey={recaptchaSiteKey}
            onChange={setCaptchaToken}
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !captchaToken}
          >
            {isLoading ? "Creating account..." : "Start 7-Day Free Trial →"}
          </button>
        </form>

        <p className="terms-note">
          By signing up you agree to our <a>Terms of Service</a> and{" "}
          <a>Privacy Policy</a>.<br />
          No credit card required.
        </p>
      </div>
    </div>
  );
}
