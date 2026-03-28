import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'OfferIQ AI Builder',
  description: 'AI-Powered Page Builder based on Puck logic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `
          body { font-family: 'DM Sans', sans-serif; }
        `}} />
      </head>
      <body className="min-h-screen bg-background text-foreground overflow-x-hidden text-sm">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
