import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogProvider } from "./providers";

export const metadata: Metadata = {
  title: "OfferIQ AI Builder",
  description: "AI-Powered Page Builder based on Puck logic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body { font-family: 'DM Sans', sans-serif; }
        `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#050505] text-foreground overflow-x-hidden text-sm relative">
        {/* Global Mesh Gradient Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#050505]">
          <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vh] rounded-full bg-[#f5a623]/15 blur-[150px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-[#ff6b35]/15 blur-[150px]" />
        </div>
        
        <PostHogProvider>
          <div className="relative z-0 min-h-screen flex flex-col">
            {children}
          </div>
          <Toaster theme="dark" position="bottom-right" />
        </PostHogProvider>
      </body>
    </html>
  );
}
