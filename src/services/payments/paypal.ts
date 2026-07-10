import { PaymentProvider, PaymentCheckoutOptions, PaymentWebhookResult } from './index';

export const PaypalProvider: PaymentProvider = {
  async createCheckout(options: PaymentCheckoutOptions, credentials: any) {
    if (!credentials?.clientId || !credentials?.secretKey) {
      return { error: 'Missing PayPal client ID or secret key.' };
    }

    try {
      const isSandbox = !credentials?.isLive;
      const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

      // 1. Get Access Token
      const auth = Buffer.from(`${credentials.clientId}:${credentials.secretKey}`).toString('base64');
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return { error: 'Failed to authenticate with PayPal.' };
      }
      const accessToken = tokenData.access_token;

      // Ensure amount format
      const formattedAmount = options.amount.toFixed(2);

      // We only implement one_time here for simplicity. Recurring requires creating a product and plan first via API.
      if (options.paymentType === 'recurring') {
        return { error: 'PayPal recurring subscriptions require pre-configured billing plans.' };
      }

      // 2. Create Order
      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: options.currency.toUpperCase(),
            value: formattedAmount,
            breakdown: {
              item_total: {
                currency_code: options.currency.toUpperCase(),
                value: formattedAmount
              }
            }
          },
          description: options.productName,
          items: [{
            name: options.productName,
            description: options.productDescription || options.productName,
            quantity: '1',
            unit_amount: {
              currency_code: options.currency.toUpperCase(),
              value: formattedAmount
            }
          }]
        }],
        application_context: {
          return_url: options.successUrl,
          cancel_url: options.cancelUrl,
          user_action: 'PAY_NOW'
        }
      };

      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await orderRes.json();
      if (orderData.error || orderData.name === 'ERROR') {
        return { error: orderData.message || 'Failed to create PayPal order.' };
      }

      const approvalLink = orderData.links?.find((link: any) => link.rel === 'approve');
      if (!approvalLink) {
        return { error: 'Could not find PayPal approval link.' };
      }

      return { url: approvalLink.href, externalId: orderData.id };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  async verifyWebhook(req: Request, credentials: any): Promise<PaymentWebhookResult> {
    if (!credentials?.webhookId) {
      return { isValid: false, error: 'Missing PayPal webhook ID.' };
    }

    try {
      const isSandbox = !credentials?.isLive;
      const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

      // 1. Get Access Token
      const auth = Buffer.from(`${credentials.clientId}:${credentials.secretKey}`).toString('base64');
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      const rawBody = await req.text();
      
      // 2. Verify webhook signature
      const verifyPayload = {
        auth_algo: req.headers.get('paypal-auth-algo'),
        cert_url: req.headers.get('paypal-cert-url'),
        transmission_id: req.headers.get('paypal-transmission-id'),
        transmission_sig: req.headers.get('paypal-transmission-sig'),
        transmission_time: req.headers.get('paypal-transmission-time'),
        webhook_id: credentials.webhookId,
        webhook_event: JSON.parse(rawBody)
      };

      const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyPayload)
      });

      const verifyData = await verifyRes.json();
      if (verifyData.verification_status !== 'SUCCESS') {
        return { isValid: false, error: 'Invalid PayPal webhook signature.' };
      }

      const event = JSON.parse(rawBody);

      if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const capture = event.resource;
        
        return {
          isValid: true,
          externalPaymentId: capture.id,
          paymentType: 'one_time',
          paymentStatus: 'success',
          amount: parseFloat(capture.amount.value),
          currency: capture.amount.currency_code,
          payerEmail: capture.payer?.email_address || '', // Might need to query order for payer details
          payerName: `${capture.payer?.name?.given_name || ''} ${capture.payer?.name?.surname || ''}`.trim(),
          metadata: {},
          rawPayload: event,
        };
      }

      return { isValid: true, paymentStatus: 'pending' };
    } catch (err: any) {
      return { isValid: false, error: err.message };
    }
  }
};
