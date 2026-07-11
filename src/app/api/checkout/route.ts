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
    const { funnelId, gateway, productId, successUrl, cancelUrl, metadata } = body;
    let { amount, currency, paymentType, productName } = body;

    if (!funnelId || !gateway) {
      return NextResponse.json({ error: 'Missing required checkout parameters' }, { status: 400 });
    }

    const provider = providers[gateway];
    if (!provider) {
      return NextResponse.json({ error: `Unsupported payment gateway: ${gateway}` }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the funnel to get the workspace_id
    const { data: funnel, error: funnelError } = await supabase
      .from('funnels')
      .select('workspace_id, name')
      .eq('id', funnelId)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
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

    if (!amount || !currency || !productName) {
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
      .eq('gateway', gateway)
      .single();

    if (integrationError || !integration || !integration.credentials) {
      return NextResponse.json({ error: `Payment gateway ${gateway} is not configured for this workspace.` }, { status: 400 });
    }

    // Call the respective provider to create the checkout
    const protocol = req.headers.get('host')?.includes('localhost') ? 'http' : 'https';
    const hostUrl = `${protocol}://${req.headers.get('host')}`;

    const result = await provider.createCheckout({
      funnelId,
      amount,
      currency,
      paymentType: paymentType || 'one_time',
      productName,
      successUrl: successUrl || `${hostUrl}/thankyou`,
      cancelUrl: cancelUrl || `${hostUrl}/cancel`,
      metadata: {
        ...metadata,
        funnelId,
        productId,
        paymentType: paymentType || 'one_time',
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
