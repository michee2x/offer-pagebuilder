import Stripe from 'stripe';
import { PaymentProvider, PaymentCheckoutOptions, PaymentWebhookResult } from './index';

export const StripeProvider: PaymentProvider = {
  async createCheckout(options: PaymentCheckoutOptions, credentials: any) {
    if (!credentials?.accountId) {
      return { error: 'Missing Stripe Connect account ID.' };
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { error: 'Platform Stripe Secret Key is not configured.' };
    }

    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16' as any,
      });

      const isZeroDecimal = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'].includes(options.currency.toUpperCase());
      const amountInCents = isZeroDecimal ? Math.round(options.amount) : Math.round(options.amount * 100);

      const sessionPayload: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: options.currency,
              product_data: {
                name: options.productName,
                description: options.productDescription,
              },
              unit_amount: amountInCents,
              ...(options.paymentType === 'recurring' && options.frequencyDays
                ? {
                    recurring: {
                      interval: 'day',
                      interval_count: options.frequencyDays,
                    },
                  }
                : {}),
            },
            quantity: 1,
          },
        ],
        mode: options.paymentType === 'recurring' ? 'subscription' : 'payment',
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        metadata: options.metadata || {},
      };

      // Create session on behalf of the connected account
      const session = await stripe.checkout.sessions.create(sessionPayload, {
        stripeAccount: credentials.accountId,
      });

      return { url: session.url as string };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  async verifyWebhook(req: Request, credentials: any): Promise<PaymentWebhookResult> {
    if (!credentials?.accountId || !credentials?.webhookSecret) {
      // In a real Stripe Connect setup, you often configure one master webhook endpoint 
      // for all connected accounts, and pass the webhook secret from env.
      // Alternatively, the user might still provide a webhook secret if they configured it themselves,
      // but usually the platform manages it. For now, we expect credentials.webhookSecret.
      return { isValid: false, error: 'Missing Stripe credentials.' };
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { isValid: false, error: 'Platform Stripe Secret Key is not configured.' };
    }

    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16' as any,
      });

      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        return { isValid: false, error: 'No Stripe signature found.' };
      }

      const rawBody = await req.text();
      // Verify signature using the webhook secret
      const event = stripe.webhooks.constructEvent(rawBody, signature, credentials.webhookSecret);

      let externalPaymentId = '';
      let paymentType: 'one_time' | 'recurring' = 'one_time';
      let amount = 0;
      let currency = '';
      let payerEmail = '';
      let payerName = '';
      let metadata: any = {};

      const session = event.data.object as any;

      if (event.type === 'checkout.session.completed') {
        if (session.subscription) {
          // Recurring payments are handled by invoice.paid, so we skip this
          return { isValid: true, paymentStatus: 'pending' };
        }

        externalPaymentId = session.id;
        paymentType = 'one_time';
        currency = session.currency.toUpperCase();
        
        const isZeroDecimal = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'].includes(currency);
        amount = isZeroDecimal ? session.amount_total : session.amount_total / 100;
        
        payerEmail = session.customer_details?.email || '';
        payerName = session.customer_details?.name || '';
        metadata = session.metadata || {};

        return {
          isValid: true,
          externalPaymentId,
          paymentType,
          paymentStatus: 'success',
          amount,
          currency,
          payerEmail,
          payerName,
          metadata,
          rawPayload: event,
        };
      } 
      else if (event.type === 'invoice.paid') {
        externalPaymentId = session.id; // Or charge ID
        paymentType = 'recurring';
        currency = session.currency.toUpperCase();

        const isZeroDecimal = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'].includes(currency);
        amount = isZeroDecimal ? session.amount_paid : session.amount_paid / 100;

        payerEmail = session.customer_email || '';
        payerName = session.customer_name || '';
        
        // Metadata is usually attached to the subscription line item
        metadata = session.lines?.data?.[0]?.metadata || {};

        return {
          isValid: true,
          externalPaymentId,
          paymentType,
          paymentStatus: 'success',
          amount,
          currency,
          payerEmail,
          payerName,
          metadata,
          rawPayload: event,
        };
      }

      return { isValid: true, paymentStatus: 'pending' };

    } catch (err: any) {
      return { isValid: false, error: err.message };
    }
  }
};

