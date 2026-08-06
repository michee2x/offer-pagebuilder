import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogProvider } from "./providers";
import { PaddleProvider } from "@/components/PaddleProvider";

// ── Fonts loaded via next/font (eliminates render-blocking Google Fonts CSS) ──
const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  weight: "variable",
  display: "swap",
  variable: "--font-dm-sans",
});

const BASE_URL = "https://www.ofiq.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "OfferIQ - Creating Profitable Offers From Anything",
    template: "%s | OfferIQ",
  },
  description:
    "OfferIQ turns any idea into a complete, revenue-ready offer — strategy, copy, funnel, and traffic plan — built in one session.",
  keywords: [
    "AI offer builder",
    "sales funnel builder",
    "AI marketing",
    "offer strategy",
    "funnel builder AI",
    "sales page generator",
    "course creator tools",
    "OfferIQ",
  ],
  authors: [{ name: "OfferIQ" }],
  creator: "OfferIQ",
  publisher: "OfferIQ",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "OfferIQ",
    title: "OfferIQ - Creating Profitable Offers From Anything",
    description:
      "OfferIQ turns any idea into a complete, revenue-ready offer — strategy, copy, funnel, and traffic plan — built in one session.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OfferIQ - Creating Profitable Offers From Anything",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OfferIQ - Creating Profitable Offers From Anything",
    description:
      "OfferIQ turns any idea into a complete, revenue-ready offer — strategy, copy, funnel, and traffic plan — built in one session.",
    images: ["/og-image.png"],
    creator: "@offeriq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "RHiR-AZc-5kaJO1m6UrcpacTtm_Byjm9vfJh1mniFOM",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${dmSans.variable}`}>
      <head>
        {/* Preconnect for YouTube facade thumbnail (above-the-fold) */}
        <link rel="preconnect" href="https://i.ytimg.com" />
        {/* dns-prefetch for non-critical origins (decorative lazy images) */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://assets.aceternity.com" />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        {/* Hotjar — loaded after interaction to avoid blocking LCP */}
        {process.env.NEXT_PUBLIC_HOTJAR_ID && (
          <Script
            id="hotjar"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `,
            }}
          />
        )}
      </head>
      <body
        className={`min-h-screen bg-[#050505] text-foreground overflow-x-hidden text-sm relative ${dmSans.className}`}
      >
        {/* Global Mesh Gradient Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#050505]">
          <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vh] rounded-full bg-[#f5a623]/15 blur-[150px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-[#ff6b35]/15 blur-[150px]" />
        </div>

        <PostHogProvider>
          <PaddleProvider>
            <div className="relative z-0 min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster theme="dark" position="bottom-right" />
          </PaddleProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
