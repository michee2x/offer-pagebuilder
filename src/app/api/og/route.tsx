import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pageId = searchParams.get('id')

  let title = 'OfferIQ Funnel'
  let description = 'A high-converting funnel built with OfferIQ.'
  let pageName = 'Untitled Page'

  if (pageId) {
    try {
      const supabase = createAdminClient()
      const { data: page } = await supabase
        .from('builder_pages')
        .select('name, seo_title, seo_description')
        .eq('id', pageId)
        .single()

      if (page) {
        pageName    = page.name        || 'Untitled Page'
        title       = page.seo_title   || page.name        || title
        description = page.seo_description || description
      }
    } catch {
      // use defaults
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#09090b',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(245,166,35,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            top: '-160px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            padding: '60px 72px',
            position: 'relative',
          }}
        >
          {/* Top: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f5a623 0%, #f5a62388 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '900',
                color: '#09090b',
              }}
            >
              ⚡
            </div>
            <span
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#a1a1aa',
                letterSpacing: '-0.3px',
              }}
            >
              OfferIQ
            </span>

            {/* Live badge */}
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '100px',
                padding: '6px 14px',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Middle: Main text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#f5a623',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Funnel Page
            </div>
            <div
              style={{
                fontSize: title.length > 40 ? '48px' : '60px',
                fontWeight: '800',
                color: '#fafafa',
                lineHeight: 1.1,
                letterSpacing: '-2px',
                maxWidth: '780px',
              }}
            >
              {title}
            </div>
            {description && (
              <div
                style={{
                  fontSize: '22px',
                  color: '#71717a',
                  lineHeight: 1.5,
                  maxWidth: '680px',
                  fontWeight: '400',
                }}
              >
                {description.length > 120
                  ? description.slice(0, 120) + '…'
                  : description}
              </div>
            )}
          </div>

          {/* Bottom: URL hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px 20px',
              alignSelf: 'flex-start',
            }}
          >
            <span style={{ fontSize: '15px', color: '#52525b' }}>🌐</span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#52525b',
                fontFamily: 'monospace',
              }}
            >
              ofiq.app
            </span>
            <span style={{ fontSize: '15px', color: '#3f3f46' }}>/</span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#a1a1aa',
                fontFamily: 'monospace',
              }}
            >
              {pageName}
            </span>
          </div>
        </div>

        {/* Bottom golden bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #f5a623, #f5a62366, transparent)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
