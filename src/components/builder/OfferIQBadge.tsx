'use client';

import React, { useState, useEffect, useCallback } from 'react';

/* ─── Shared SVG bolt icon ──────────────────────────────────── */
function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M13 2L4.09 12.97H11L10 22l8.91-10.97H13L13 2z" />
    </svg>
  );
}

/* ─── Footer Badge (permanent, cannot be dismissed) ─────────── */
export function FooterBadge() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '14px 24px',
        background: 'linear-gradient(135deg, rgba(99,68,245,0.06) 0%, rgba(24,204,252,0.04) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        width: '100%',
      }}
    >
      <a
        href="https://ofiq.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          textDecoration: 'none',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(99,68,245,0.35)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.25)';
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #18CCFC, #6344F5 50%, #AE48FF)',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: '10px', height: '10px' }}
          >
            <path d="M13 2L4.09 12.97H11L10 22l8.91-10.97H13L13 2z" />
          </svg>
        </span>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          Built with{' '}
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #18CCFC, #6344F5 50%, #AE48FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}
          >
            OfferIQ
          </span>
        </span>
      </a>
    </div>
  );
}

/* ─── Floating Badge (dismissible, hides at footer) ──────────── */
export function FloatingBadge() {
  const [dismissed, setDismissed] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check sessionStorage — if dismissed this session, don't show
    try {
      if (sessionStorage.getItem('offeriq_badge_dismissed') === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      // sessionStorage unavailable (e.g. private mode) — show badge anyway
    }

    const handleScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Hide floating badge when within 120px of the page bottom (footer badge area)
      setNearFooter(docHeight - scrollBottom < 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem('offeriq_badge_dismissed', '1');
    } catch {
      // ignore
    }
  }, []);

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted || dismissed || nearFooter) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        animation: 'offeriq-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style>{`
        @keyframes offeriq-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .offeriq-float-link:hover {
          box-shadow: 0 6px 24px rgba(99,68,245,0.45) !important;
          transform: translateY(-1px) !important;
        }
        .offeriq-dismiss:hover {
          background: rgba(255,255,255,0.15) !important;
          color: rgba(255,255,255,0.9) !important;
        }
      `}</style>

      <a
        href="https://ofiq.app"
        target="_blank"
        rel="noopener noreferrer"
        className="offeriq-float-link"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          padding: '8px 16px 8px 10px',
          borderRadius: '100px 0 0 100px',
          background: 'rgba(10,10,16,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRight: 'none',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #18CCFC, #6344F5 50%, #AE48FF)',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(99,68,245,0.5)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: '12px', height: '12px' }}
          >
            <path d="M13 2L4.09 12.97H11L10 22l8.91-10.97H13L13 2z" />
          </svg>
        </span>
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          Built with{' '}
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #18CCFC, #6344F5 50%, #AE48FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}
          >
            OfferIQ
          </span>
        </span>
      </a>

      {/* Dismiss button — separate pill segment */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss OfferIQ badge"
        className="offeriq-dismiss"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '38px',
          borderRadius: '0 100px 100px 0',
          background: 'rgba(10,10,16,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
          lineHeight: 1,
          transition: 'background 0.15s ease, color 0.15s ease',
          padding: 0,
          outline: 'none',
        }}
      >
        ×
      </button>
    </div>
  );
}
