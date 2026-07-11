import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { StripeProvider, PaypalProvider, PaystackProvider } from '@/services/payments';
import { Resend } from 'resend'; // Assuming resend is installed, or we can use existing mail service if available

const providers: Record<string, any> = {
  stripe: StripeProvider,
  paypal: PaypalProvider,
  paystack: PaystackProvider,
};

// We disable body parsing to access the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request, { params }: { params: Promise<{ gateway: string; funnelId: string }> }) {
  try {
    const { gateway, funnelId } = await params;
    const provider = providers[gateway];

    if (!provider) {
      return NextResponse.json({ error: `Unsupported payment gateway: ${gateway}` }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch funnel to get workspace_id
    const { data: funnel, error: funnelError } = await supabase
      .from('builder_pages')
      .select('id, workspace_id, name')
      .eq('id', funnelId)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // 2. Fetch payment integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('payment_integrations')
      .select('credentials')
      .eq('workspace_id', funnel.workspace_id)
      .eq('gateway', gateway)
      .single();

    if (integrationError || !integration || !integration.credentials) {
      return NextResponse.json({ error: `Payment gateway ${gateway} is not configured.` }, { status: 400 });
    }

    // 3. Verify Webhook using the provider
    // Note: To verify the signature, the provider needs the raw Request object.
    // The provider's `verifyWebhook` method will read the raw text.
    // We clone the request because some providers might need to read it differently or if it fails we can't re-read.
    const result = await provider.verifyWebhook(req.clone(), integration.credentials);

    if (!result.isValid) {
      console.error(`[Webhook] Invalid signature for ${gateway}:`, result.error);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // 4. Log the purchase if successful
    if (result.paymentStatus === 'success') {
      
      // Check if already processed
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('external_payment_id', result.externalPaymentId)
        .single();

      if (!existingPurchase) {
        // Insert into database
        const { error: insertError } = await supabase
          .from('purchases')
          .insert({
            funnel_id: funnelId,
            external_payment_id: result.externalPaymentId,
            gateway,
            payment_type: result.paymentType,
            payment_status: result.paymentStatus,
            amount: result.amount,
            currency: result.currency,
            payer_email: result.payerEmail,
            payer_name: result.payerName,
            raw_webhook_payload: result.rawPayload
          });

        if (insertError) {
          console.error('[Webhook] Failed to log purchase:', insertError);
        }

        // 5. Send Product Delivery Email
        if (result.payerEmail) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'OfferIQ Delivery <delivery@ofiq.app>',
              to: result.payerEmail,
              subject: `Your purchase of ${funnel.name}`,
              html: `<p>Hi ${result.payerName || 'there'},</p>
                     <p>Thank you for purchasing <strong>${funnel.name}</strong>!</p>
                     <p>Click the link below to access your product:</p>
                     <a href="https://${req.headers.get('host')}/p/${funnelId}/delivery">Access Product</a>
                     <p>Thanks,<br>The OfferIQ Team</p>`
            });
          } catch (emailError) {
            console.error('[Webhook] Failed to send delivery email:', emailError);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`[Webhook] Server error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
