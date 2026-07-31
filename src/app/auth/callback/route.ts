import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'invite', 'recovery', etc.

  if (code) {
    const response = NextResponse.redirect(
      // If it's an invite, send them to the set-password page
      // Otherwise fall back to the home page
      type === 'invite'
        ? new URL('/auth/invite', origin)
        : new URL('/', origin)
    )

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(new URL('/auth/invite?error=invalid_code', origin))
    }

    // Session is now set in cookies — redirect user to invite page
    return response
  }

  // No code — redirect to home
  return NextResponse.redirect(new URL('/', origin))
}
