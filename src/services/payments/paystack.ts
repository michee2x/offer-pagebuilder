import { PaymentProvider, PaymentCheckoutOptions, PaymentWebhookResult } from './index';
import crypto from 'crypto';

export const PaystackProvider: PaymentProvider = {
  async createCheckout(options: PaymentCheckoutOptions, credentials: any) {
    if (!credentials?.secretKey) {
      return { error: 'Missing Paystack secret key.' };
    }

    try {
      const isZeroDecimal = false; // Paystack currencies typically use minor units (kobo, pesewas, cents)
      const amount = Math.round(options.amount * 100);

      // Depending on whether it's one-time or recurring, Paystack handles subscriptions via plan_code
      // For simplicity here, we assume if recurring, a plan code is provided in options.metadata.plan_code
      // Otherwise, Paystack subscriptions require creating a plan first. We'll stick to simple payments here unless plan_code is provided.

      const payload: any = {
        amount,
        email: 'customer@example.com', // Paystack requires email to init transaction. We might need it in options, or pass a dummy
        currency: options.currency,
        callback_url: options.successUrl, // Note: Paystack redirects here on success
        metadata: {
          ...options.metadata,
          cancel_action: options.cancelUrl
        }
      };

      // In a real scenario, we should ask for buyer email first or use a placeholder if the platform doesn't know it yet.
      // We'll require payerEmail or use a generic one if missing, but Paystack requires an email.
      if (options.metadata?.payerEmail) {
        payload.email = options.metadata.payerEmail;
      }

      if (options.paymentType === 'recurring' && options.metadata?.plan_code) {
        payload.plan = options.metadata.plan_code;
      }

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.status) {
        return { error: data.message };
      }

      return { url: data.data.authorization_url, externalId: data.data.reference };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  async verifyWebhook(req: Request, credentials: any): Promise<PaymentWebhookResult> {
    if (!credentials?.secretKey) {
      return { isValid: false, error: 'Missing Paystack secret key.' };
    }

    try {
      const signature = req.headers.get('x-paystack-signature');
      if (!signature) {
        return { isValid: false, error: 'No Paystack signature found.' };
      }

      const rawBody = await req.text();
      const hash = crypto.createHmac('sha512', credentials.secretKey).update(rawBody).digest('hex');

      if (hash !== signature) {
        return { isValid: false, error: 'Invalid Paystack signature.' };
      }

      const event = JSON.parse(rawBody);

      if (event.event === 'charge.success') {
        const externalPaymentId = event.data.id.toString();
        const paymentType = event.data.plan?.id ? 'recurring' : 'one_time';
        const currency = event.data.currency.toUpperCase();
        const amount = event.data.amount / 100;
        
        const payerEmail = event.data.customer?.email || '';
        const payerName = `${event.data.customer?.first_name || ''} ${event.data.customer?.last_name || ''}`.trim();
        const metadata = event.data.metadata || {};

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
