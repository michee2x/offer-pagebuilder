import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  experimental: {
    outputFileTracingIncludes: {
      "/api/offer-intelligence/parse-pdf": ["./node_modules/pdfjs-dist/**/*", "./node_modules/pdf-parse/**/*"]
    }
  }
};

export default nextConfig;
