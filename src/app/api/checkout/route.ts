import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { StripeProvider, PaypalProvider, PaystackProvider } from '@/services/payments';

const providers: Record<string, any> = {
  stripe: StripeProvider,
  paypal: PaypalProvider,
  paystack: PaystackProvider,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { funnelId, gateway, productId, pagePath, successUrl, cancelUrl, metadata, payerEmail } = body;
    let { amount, currency, paymentType, productName } = body;

    if (!funnelId || !gateway) {
      return NextResponse.json({ error: 'Missing required checkout parameters' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the funnel to get the workspace_id
    const { data: funnel, error: funnelError } = await supabase
      .from('builder_pages')
      .select('workspace_id, name')
      .eq('id', funnelId)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Fetch the funnel's published domain/subdomain for redirect URLs
    const { data: publishedPage } = await supabase
      .from('builder_pages')
      .select('subdomain, custom_domain')
      .eq('id', funnelId)
      .single();

    const protocol = req.headers.get('host')?.includes('localhost') ? 'http' : 'https';
    const hostUrl = `${protocol}://${req.headers.get('host')}`;
    
    // Build the funnel's live base URL for success/cancel redirects
    let funnelBaseUrl = hostUrl;
    if (publishedPage?.custom_domain) {
      funnelBaseUrl = `https://${publishedPage.custom_domain}`;
    } else if (publishedPage?.subdomain) {
      const isLocal = req.headers.get('host')?.includes('localhost');
      funnelBaseUrl = isLocal
        ? `http://${publishedPage.subdomain}.localhost:3000`
        : `https://${publishedPage.subdomain}.ofiq.app`;
    }

    // If productId is provided, fetch product details from DB
    let resolvedProductId = productId;
    if (!resolvedProductId && pagePath) {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: true });

      if (products && products.length > 0) {
        let productIndex = 0;
        if (pagePath.includes('upsell')) productIndex = 1;
        else if (pagePath.includes('downsell')) productIndex = 2;

        const product = products[productIndex] || products[0];
        amount = product.price;
        currency = product.currency;
        paymentType = product.payment_type;
        productName = product.name;
        resolvedProductId = product.id;
      }
    } else if (resolvedProductId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', resolvedProductId)
        .eq('funnel_id', funnelId)
        .single();

      if (!productError && product) {
        amount = product.price;
        currency = product.currency;
        paymentType = product.payment_type;
        productName = product.name;
      }
    }

    if (amount === undefined || amount === null || !currency || !productName) {
      return NextResponse.json({ error: 'Missing product pricing details or no products found for this funnel.' }, { status: 400 });
    }

    // Auto-select gateway if 'auto'
    let selectedGateway = gateway;
    if (selectedGateway === 'auto') {
      const { data: availableIntegrations } = await supabase
        .from('payment_integrations')
        .select('gateway')
        .eq('workspace_id', funnel.workspace_id)
        .limit(1);
      
      if (availableIntegrations && availableIntegrations.length > 0) {
        selectedGateway = availableIntegrations[0].gateway;
      } else {
        return NextResponse.json({ error: 'No payment gateways are configured for this workspace.' }, { status: 400 });
      }
    }

    const provider = providers[selectedGateway];
    if (!provider) {
      return NextResponse.json({ error: `Unsupported payment gateway: ${selectedGateway}` }, { status: 400 });
    }

    // Fetch the payment integration credentials for this workspace and gateway
    const { data: integration, error: integrationError } = await supabase
      .from('payment_integrations')
      .select('*')
      .eq('workspace_id', funnel.workspace_id)
      .eq('gateway', selectedGateway)
      .single();

    if (integrationError || !integration || !integration.credentials) {
      return NextResponse.json({ error: `Payment gateway ${selectedGateway} is not configured for this workspace.` }, { status: 400 });
    }

    // Paystack strictly requires an email. If we don't have one, abort and tell the frontend to prompt for it.
    if (selectedGateway === 'paystack' && !payerEmail) {
      return NextResponse.json({ error: 'paystack_email_required' }, { status: 400 });
    }

    // Call the respective provider to create the checkout
    const result = await provider.createCheckout({
      funnelId,
      amount,
      currency,
      paymentType: paymentType || 'one_time',
      productName,
      successUrl: successUrl || `${funnelBaseUrl}/thankyou`,
      cancelUrl: cancelUrl || `${funnelBaseUrl}/sales`,
      metadata: {
        ...metadata,
        funnelId,
        productId: resolvedProductId,
        paymentType: paymentType || 'one_time',
        payerEmail: payerEmail || undefined,
      }
    }, integration.credentials);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error: any) {
    console.error('[checkout] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const funnelId = searchParams.get('funnelId');
    const gateway = searchParams.get('gateway') || 'auto';
    const productId = searchParams.get('productId');
    const pagePath = searchParams.get('pagePath');
    const payerEmail = searchParams.get('payerEmail');

    if (!funnelId || !gateway) {
      return NextResponse.json({ error: 'Missing required checkout parameters' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: funnel, error: funnelError } = await supabase
      .from('builder_pages')
      .select('workspace_id, name')
      .eq('id', funnelId)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const { data: publishedPage } = await supabase
      .from('builder_pages')
      .select('subdomain, custom_domain')
      .eq('id', funnelId)
      .single();

    const protocol = req.headers.get('host')?.includes('localhost') ? 'http' : 'https';
    const hostUrl = `${protocol}://${req.headers.get('host')}`;
    
    let funnelBaseUrl = hostUrl;
    if (publishedPage?.custom_domain) {
      funnelBaseUrl = `https://${publishedPage.custom_domain}`;
    } else if (publishedPage?.subdomain) {
      const isLocal = req.headers.get('host')?.includes('localhost');
      funnelBaseUrl = isLocal
        ? `http://${publishedPage.subdomain}.localhost:3000`
        : `https://${publishedPage.subdomain}.ofiq.app`;
    }

    let resolvedProductId = productId;
    let amount, currency, paymentType, productName;

    if (!resolvedProductId && pagePath) {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: true });

      if (products && products.length > 0) {
        let productIndex = 0;
        if (pagePath.includes('upsell')) productIndex = 1;
        else if (pagePath.includes('downsell')) productIndex = 2;

        const product = products[productIndex] || products[0];
        amount = product.price;
        currency = product.currency;
        paymentType = product.payment_type;
        productName = product.name;
        resolvedProductId = product.id;
      }
    } else if (resolvedProductId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', resolvedProductId)
        .eq('funnel_id', funnelId)
        .single();

      if (!productError && product) {
        amount = product.price;
        currency = product.currency;
        paymentType = product.payment_type;
        productName = product.name;
      }
    }

    if (amount === undefined || amount === null || !currency || !productName) {
      return NextResponse.json({ error: 'Missing product pricing details or no products found for this funnel.' }, { status: 400 });
    }

    let selectedGateway = gateway;
    if (selectedGateway === 'auto') {
      const { data: availableIntegrations } = await supabase
        .from('payment_integrations')
        .select('gateway')
        .eq('workspace_id', funnel.workspace_id)
        .limit(1);
      
      if (availableIntegrations && availableIntegrations.length > 0) {
        selectedGateway = availableIntegrations[0].gateway;
      } else {
        return NextResponse.json({ error: 'No payment gateways are configured for this workspace.' }, { status: 400 });
      }
    }

    const provider = providers[selectedGateway];
    if (!provider) {
      return NextResponse.json({ error: `Unsupported payment gateway: ${selectedGateway}` }, { status: 400 });
    }

    const { data: integration, error: integrationError } = await supabase
      .from('payment_integrations')
      .select('*')
      .eq('workspace_id', funnel.workspace_id)
      .eq('gateway', selectedGateway)
      .single();

    if (integrationError || !integration || !integration.credentials) {
      return NextResponse.json({ error: `Payment gateway ${selectedGateway} is not configured for this workspace.` }, { status: 400 });
    }

    if (selectedGateway === 'paystack' && !payerEmail) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Checkout Details</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #18181b; padding: 2rem; border-radius: 1rem; border: 1px solid #27272a; max-width: 400px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h2 { margin-top: 0; font-size: 1.25rem; }
            p { color: #a1a1aa; font-size: 0.875rem; margin-bottom: 1.5rem; }
            input { width: 100%; box-sizing: border-box; background: #09090b; border: 1px solid #27272a; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 1rem; }
            input:focus { outline: none; border-color: #6366f1; }
            button { width: 100%; background: #6366f1; color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer; transition: background 0.2s; font-size: 1rem; }
            button:hover { background: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Enter your email</h2>
            <p>We need your email address to send your receipt and deliver your purchase.</p>
            <form method="GET" action="/api/checkout">
              <input type="hidden" name="funnelId" value="${funnelId}" />
              <input type="hidden" name="gateway" value="${gateway}" />
              <input type="hidden" name="productId" value="${resolvedProductId || ''}" />
              <input type="hidden" name="pagePath" value="${pagePath || ''}" />
              <input type="email" name="payerEmail" placeholder="your@email.com" required autofocus />
              <button type="submit">Continue to Checkout</button>
            </form>
          </div>
        </body>
        </html>
      `;
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
    }

    const result = await provider.createCheckout({
      funnelId,
      amount,
      currency,
      paymentType: paymentType || 'one_time',
      productName,
      successUrl: `${funnelBaseUrl}/thankyou`,
      cancelUrl: `${funnelBaseUrl}/sales`,
      metadata: {
        funnelId,
        productId: resolvedProductId,
        paymentType: paymentType || 'one_time',
        payerEmail: payerEmail || undefined,
      }
    }, integration.credentials);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.redirect(result.url);
  } catch (error: any) {
    console.error('[checkout GET] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
