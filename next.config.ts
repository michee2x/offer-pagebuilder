import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Inline critical CSS, defer the rest — eliminates render-blocking chunks ──
  experimental: {
    optimizeCss: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      }
    ],
    // Bypass Next.js built-in image optimization API to prevent 500 errors and missing domains
    unoptimized: true,
  },

  // Remove console.log in production builds, keep errors
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
};

export default nextConfig;
