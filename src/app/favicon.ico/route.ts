import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(req: Request) {
    const supabase = createAdminClient();
    const headers = new Headers(req.headers);
    const host = headers.get('host') || '';
    
    const requestUrl = new URL(req.url);
    const origin = requestUrl.origin;

    const fallbackFavicon = async () => {
        try {
            const res = await fetch(`${origin}/default-favicon.ico`);
            if (res.ok) {
                return new NextResponse(await res.blob(), {
                    headers: {
                        'Content-Type': 'image/x-icon',
                        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load default favicon', e);
        }
        return new NextResponse(null, { status: 404 });
    }

    let subdomainMatch = null;
    let customDomainMatch = host;

    // We assume any localhost with a subdomain is a dev subdomain eg: demo.localhost:3000
    if (host.includes('localhost') && host.split('.').length > 1 && host !== '127.0.0.1') {
        const parts = host.split('.');
        if (parts.length >= 2 && parts[1].startsWith('localhost')) {
            subdomainMatch = parts[0];
            customDomainMatch = ''; // not a custom domain
        }
    } else {
        const baseHost = 'ofiq.app';
        if (host.endsWith(`.${baseHost}`)) {
            subdomainMatch = host.replace(`.${baseHost}`, '');
            customDomainMatch = '';
        }
    }

    try {
        let query = supabase.from('builder_pages').select('favicon_url');
        
        if (subdomainMatch) {
            query = query.eq('subdomain', subdomainMatch);
        } else if (customDomainMatch && !customDomainMatch.startsWith('localhost') && customDomainMatch !== 'ofiq.app') {
            query = query.eq('custom_domain', customDomainMatch);
        } else {
            return fallbackFavicon();
        }

        const { data: page } = await query.single();

        if (page?.favicon_url) {
            const imageRes = await fetch(page.favicon_url);
            if (imageRes.ok) {
                const blob = await imageRes.blob();
                return new NextResponse(blob, {
                    headers: {
                        'Content-Type': imageRes.headers.get('Content-Type') || 'image/x-icon',
                        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                    }
                });
            }
        }
    } catch(e) {
        console.error('Favicon Proxy Error:', e);
    }

    return fallbackFavicon();
}
