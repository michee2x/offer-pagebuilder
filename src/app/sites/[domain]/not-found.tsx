import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#050505] text-white p-6 font-sans relative overflow-hidden">
      
      {/* Subtle background noise and ambient glow */}
      <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://noise-generator.com/images/noise.png")' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-white">404</h1>
          <h2 className="text-xl md:text-2xl font-medium tracking-tight text-white/70">
            Page not found
          </h2>
          <p className="text-sm md:text-base text-white/40 max-w-sm mx-auto leading-relaxed">
            The funnel destination you are looking for doesn&apos;t exist, has been paused, or was moved.
          </p>
        </div>

        <div className="pt-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold bg-white text-black rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <Home className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            Return to Main Page
          </Link>
        </div>

        <div className="pt-20">
          <a href="https://ofiq.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity group">
            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-black"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white group-hover:text-white transition-colors">Powered by OfferIQ</span>
          </a>
        </div>
      </div>
    </div>
  )
}
