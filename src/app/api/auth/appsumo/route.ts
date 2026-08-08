import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
    }

    const clientId = process.env.APPSUMO_CLIENT_ID;
    const clientSecret = process.env.APPSUMO_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/appsumo`; // Must match Partner Portal exactly

    if (!clientId || !clientSecret) {
      console.error('AppSumo OAuth: Missing credentials in .env');
      return NextResponse.redirect(new URL('/login?error=server_configuration', req.url));
    }

    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams();
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);
    tokenParams.append('redirect_uri', redirectUri);
    tokenParams.append('code', code);
    tokenParams.append('grant_type', 'authorization_code');

    const tokenResponse = await fetch('https://appsumo.com/openid/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('AppSumo OAuth Token Error:', errorText);
      return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch license key
    const licenseResponse = await fetch(`https://appsumo.com/openid/license_key/?access_token=${accessToken}`);
    
    if (!licenseResponse.ok) {
      console.error('AppSumo License Fetch Error:', await licenseResponse.text());
      return NextResponse.redirect(new URL('/login?error=license_fetch_failed', req.url));
    }

    const licenseData = await licenseResponse.json();
    const licenseKey = licenseData.license_key;

    // 3. We have the license key. Now we redirect the user to signup/login
    // We pass the license_key so the frontend can capture it and link it during account creation
    const redirectUrl = new URL('/signup', req.url);
    redirectUrl.searchParams.set('appsumo_license', licenseKey);
    
    // Check if the user is already logged in (Supabase session)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // If they are already logged in, we can link the license right now
      // This is a great user experience: they buy on AppSumo, redirect here, and since they are logged in, it auto-links
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          appsumo_license_key: licenseKey,
        })
        .eq('id', user.id);

      if (!updateError) {
        // Optionally, trigger an activation if they haven't been activated by a webhook yet
        // For now, redirect to dashboard with success message
        return NextResponse.redirect(new URL('/workspaces?appsumo=success', req.url));
      } else {
        console.error('Failed to link AppSumo license to existing user:', updateError);
        return NextResponse.redirect(new URL('/workspaces?appsumo=error', req.url));
      }
    }

    // If not logged in, send them to signup with the license parameter
    // The /signup or /login page must handle saving this appsumo_license_key during signup
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('AppSumo OAuth route error:', error);
    return NextResponse.redirect(new URL('/login?error=internal_error', req.url));
  }
}
