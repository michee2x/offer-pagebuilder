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
        hostname: "gallereee.framer.website",
      },
      {
        protocol: "https",
        hostname: "framerusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
    ],
    // Prefer modern image formats automatically
    formats: ["image/avif", "image/webp"],
  },

  // Remove console.log in production builds, keep errors
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
};

export default nextConfig;
