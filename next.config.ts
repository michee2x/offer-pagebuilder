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
  outputFileTracingIncludes: {
    "/api/offer-intelligence/parse-pdf": [
      "./node_modules/pdfjs-dist/build/**/*",
      "./node_modules/pdfjs-dist/legacy/build/**/*", // Add this line
      "./node_modules/pdf-parse/**/*"
    ]
  }
};

export default nextConfig;