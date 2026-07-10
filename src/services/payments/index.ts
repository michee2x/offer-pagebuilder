export interface PaymentCheckoutOptions {
  funnelId: string;
  amount: number;
  currency: string;
  paymentType: 'one_time' | 'recurring';
  frequencyDays?: number; // Only for recurring
  productName: string;
  productDescription?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentWebhookResult {
  isValid: boolean;
  externalPaymentId?: string;
  paymentType?: 'one_time' | 'recurring';
  paymentStatus?: 'success' | 'failed' | 'pending';
  amount?: number;
  currency?: string;
  payerEmail?: string;
  payerName?: string;
  metadata?: Record<string, string>;
  rawPayload?: any;
  error?: string;
}

export interface PaymentProvider {
  /**
   * Generates a checkout session or payment link URL for the buyer.
   */
  createCheckout(options: PaymentCheckoutOptions, credentials: any): Promise<{ url?: string; error?: string }>;

  /**
   * Parses and validates an incoming webhook request from the payment gateway.
   */
  verifyWebhook(req: Request, credentials: any): Promise<PaymentWebhookResult>;
}

export * from './stripe';
export * from './paypal';
export * from './paystack';
