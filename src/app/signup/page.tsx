"use client";

import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="oiq-login-page">
      {/* Full-bleed animated background — same as login */}
      <div
        className="oiq-wave-bg"
        aria-hidden="true"
        style={{
          backgroundImage: "url('https://framerusercontent.com/images/76arLcPQRCXlPw9OuPhZo37CtFY.jpg?scale-down-to=2048&width=3200&height=2506')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      <SignupForm />
    </div>
  );
}
