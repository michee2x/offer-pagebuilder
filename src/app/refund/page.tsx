import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy | OfferIQ',
  description: 'Refund Policy for OfferIQ',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#08080D] text-[#A6A6B3] py-20 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#60A5FA] hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-6 tracking-tight">Refund Policy</h1>
        <p className="text-sm text-[#60A5FA] font-mono mb-12">Last updated: 17/07/2026</p>

        <div className="space-y-10 text-[16px] leading-relaxed">
          <section>
            <p>
              This Refund Policy applies to purchases of OfferIQ, operated by Tendrils Solution, at ofiq.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">1. 30-Day Money-Back Guarantee</h2>
            <p className="mb-4">
              We offer a 30-day money-back guarantee on all plans — subscription and one-time — including our Agency tier.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>If you're not satisfied with OfferIQ, you can request a full refund within 30 days of your original purchase date.</li>
              <li>This applies to your first purchase of a given plan. It does not reset with each monthly renewal charge — see Section 3 for ongoing subscription billing.</li>
              <li>No detailed justification is required, though we appreciate feedback that helps us improve.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">2. How to Request a Refund</h2>
            <p className="mb-4">Email <a href="mailto:Support@ofiq.app" className="text-[#60A5FA] hover:text-white transition-colors">Support@ofiq.app</a> with:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The email address associated with your account</li>
              <li>Your order/receipt reference (found in your billing confirmation email)</li>
              <li>(Optional) A note on why OfferIQ wasn't the right fit</li>
            </ul>
            <p>
              We aim to process eligible refund requests within 5–15 business days. Refunds are returned to your original payment method via our payment processor; the time it takes to appear in your account/statement depends on your bank or card issuer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">3. Subscription Plans (Monthly Billing)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The 30-day guarantee covers your first payment after signup (including the end of any discounted trial period, if the trial converts to a paid charge).</li>
              <li>Subsequent monthly renewal charges are not eligible for the 30-day guarantee once that renewal has processed, since you're able to cancel before each renewal to avoid being charged again.</li>
              <li>To avoid a renewal charge, cancel from your account settings before your next billing date. Cancellation stops future billing; it does not retroactively refund the current billing period, except where the 30-day guarantee in Section 1 still applies to that specific charge.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">4. One-Time / Lifetime Plans</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Covered by the same 30-day guarantee from the date of purchase.</li>
              <li>If refunded, your account's associated offer credits, workspaces, and any published funnels tied to that purchase will be deactivated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">5. Credit Top-Ups</h2>
            <p>
              Individual offer-credit top-up purchases (bought outside of a plan's standard allocation) are generally non-refundable once at least one credit from that purchase has been used to generate an offer, since the underlying AI generation cost has already been incurred. Unused top-up credit purchases may be refunded within 7 days of purchase — contact support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">6. What's Not Covered</h2>
            <p className="mb-4">We reserve the right to decline a refund request where:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The request falls outside the applicable window described above.</li>
              <li>We reasonably determine the account was used to generate a high volume of offers/credits shortly before requesting a refund (i.e., extracting the value before requesting money back).</li>
              <li>The account has been suspended or terminated for violating our Terms of Service, including fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">7. Chargebacks</h2>
            <p>
              If you initiate a chargeback with your bank or card issuer instead of contacting us directly, your OfferIQ account may be suspended while the dispute is resolved. We'd always rather resolve it directly — please reach out to support first.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">8. Questions</h2>
            <address className="not-italic bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <strong className="text-[#F5F5F7]">Tendrils Solution</strong><br />
              <a href="mailto:Support@ofiq.app" className="text-[#60A5FA] hover:text-white transition-colors mt-2 inline-block">Support@ofiq.app</a>
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
