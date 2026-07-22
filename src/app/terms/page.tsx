import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | OfferIQ',
  description: 'Terms of Service for OfferIQ',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08080D] text-[#A6A6B3] py-20 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#60A5FA] hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-6 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-[#60A5FA] font-mono mb-12">Last updated: 17/07/2026</p>

        <div className="space-y-10 text-[16px] leading-relaxed">
          <section>
            <p>
              These Terms of Service ("Terms") govern your access to and use of OfferIQ (the "Service"), a product built and operated by Tendrils Solution ("Tendrils Solution," "we," "us," or "our"), a company registered in Nigeria. OfferIQ is accessible at ofiq.app and any related subdomains, apps, or services (collectively, the "Site").
            </p>
            <p className="mt-4">
              By creating an account, purchasing a plan, or otherwise using OfferIQ, you agree to be bound by these Terms. If you're using OfferIQ on behalf of a company or other legal entity, you represent that you have the authority to bind that entity, and "you" refers to that entity.
            </p>
            <p className="mt-4">
              If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">1. What OfferIQ Is</h2>
            <p>
              OfferIQ is an AI-powered platform that helps users build offers, sales funnels, marketing copy, traffic strategies, and related digital marketing assets. This includes, among other things: an Intelligence Report engine, a Copy Engine, a Page Builder, an Asset Bank, Traffic Intelligence™ outputs, email sequence generation, lead management (CRM), and analytics.
            </p>
            <p className="mt-4">
              OfferIQ uses artificial intelligence to generate strategic recommendations, written copy, page designs, and marketing assets. These outputs are generated content, not guarantees of business results. Section 8 explains this in more detail.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">2. Eligibility & Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You must provide accurate, current information when registering and keep it up to date.</li>
              <li>You're responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</li>
              <li>One account may support multiple workspaces and team members depending on your plan tier, as described in Section 4.</li>
              <li>We may suspend or terminate accounts that provide false information, are used fraudulently, or violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">3. Team Members & Workspaces</h2>
            <p className="mb-4">Depending on your plan, you may invite team members to your workspace(s) with the following roles:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Admin</strong> — full access, including billing and team management.</li>
              <li><strong>Editor</strong> — can create and manage funnels, leads, copy, and emails, but cannot access billing or team settings.</li>
              <li><strong>Viewer</strong> — read-only access.</li>
            </ul>
            <p className="mt-4">
              You are responsible for the actions of any team member you invite, and for ensuring they comply with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">4. Plans, Billing & Credits</h2>
            
            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">4.1 Plan Types</h3>
            <p>OfferIQ offers both subscription plans (billed monthly) and one-time-payment plans, as described on our Pricing page. The specific features, credit allocations, and workspace/seat limits for each tier are set out there and may be updated from time to time.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">4.2 Offer Credits</h3>
            <p className="mb-4">Certain actions in OfferIQ (building a complete offer — Intelligence Report, Copy, Pages, Traffic Strategy, and Asset Bank) consume "offer credits." Depending on your plan:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Subscription plans:</strong> credit allowances refresh each billing cycle and do not roll over month to month.</li>
              <li><strong>One-time/lifetime plans:</strong> credits are a fixed pool that does not expire and does not refresh — once used, additional credits must be purchased as top-ups or via a plan upgrade.</li>
            </ul>
            <p>Credit amounts, pricing, and top-up rates are shown in your dashboard and may change with notice.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">4.3 Trials</h3>
            <p>Where offered, promotional trial pricing (e.g., a discounted first period) converts automatically to the standard subscription rate at the end of the trial unless you cancel before it ends. You authorize us (and our payment processor) to charge your payment method accordingly.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">4.4 Billing & Payment Processing</h3>
            <p>Payments are processed by a third-party payment processor acting as merchant of record for OfferIQ subscription charges. By subscribing, you agree to that processor's applicable terms in addition to these Terms. We do not store your full payment card details.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">4.5 Price Changes</h3>
            <p>We may change our prices. For existing subscribers, we'll provide reasonable advance notice before a price change takes effect on your next billing cycle.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">4.6 Cancellation</h3>
            <p>You may cancel a subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period; we do not provide partial-period refunds except as described in our Refund Policy.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">4.7 What Happens When You Cancel</h3>
            <p>When a subscription ends, published funnels are taken offline, since active hosting is part of what your subscription pays for. Your underlying data (copy, reports, and assets already generated) remains accessible in your account for a limited window so you can export it, after which it may be deleted in line with our Data Deletion Policy. One-time/lifetime plan data is not subject to this hosting cutoff for as long as the license remains valid, but is still subject to our data retention practices generally.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">5. Acceptable Use</h2>
            <p className="mb-4">You agree not to use OfferIQ to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Build, publish, or sell anything illegal, fraudulent, or deceptive, including fake reviews, pyramid schemes, or misleading health/financial claims.</li>
              <li>Generate or publish content that infringes another party's intellectual property, privacy, or other rights.</li>
              <li>Generate content that is hateful, harassing, sexually exploitative of minors, or otherwise unlawful.</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
              <li>Attempt to reverse-engineer, scrape, or interfere with the Service, its AI models, or its infrastructure.</li>
              <li>Resell or sublicense access to OfferIQ itself (as distinct from selling your own offers built using OfferIQ, which is the intended use).</li>
              <li>Violate the acceptable use or content policies of any third-party platform or payment processor you connect to OfferIQ (including Stripe, PayPal, and any advertising platform).</li>
            </ul>
            <p>We may remove content, suspend funnels, or terminate accounts that violate this section, with or without notice, depending on severity.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">6. Your Content & Intellectual Property</h2>
            
            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">6.1 Your Content</h3>
            <p>You retain ownership of the offer inputs you provide (URLs, PDFs, descriptions) and of the funnels, copy, and assets generated for your account ("Your Content"). You grant Tendrils Solution a license to host, process, and display Your Content as needed to operate the Service — for example, to publish your funnel pages and generate your reports.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">6.2 AI-Generated Output</h3>
            <p>Subject to your compliance with these Terms and payment of applicable fees, you may use AI-generated copy, reports, page designs, and assets produced through your OfferIQ account for your own commercial purposes, including selling the offers you build.</p>
            <p className="mt-4">Because outputs are AI-generated, similar or overlapping outputs may occasionally be produced for other users working in similar niches. We do not guarantee exclusivity of any generated content.</p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">6.3 Our Platform</h3>
            <p>OfferIQ, its underlying software, design, trademarks, the "Traffic Intelligence™" name, and the underlying database of funnel patterns remain the property of Tendrils Solution. Nothing in these Terms grants you rights to our platform itself beyond the right to use the Service as intended.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">7. Third-Party Integrations</h2>
            <p>OfferIQ allows you to connect third-party services to your own funnels and workspace, including but not limited to Stripe, PayPal, Mailchimp, ConvertKit, ActiveCampaign, Zapier, and (as they become available) regional payment processors.</p>
            <p className="mt-4">These integrations are between you and the third party. When a visitor to your funnel makes a payment or opts in, that transaction/data flow is governed by your agreement with that third-party provider (e.g., Stripe's terms), not by Tendrils Solution. We are not a party to, and are not liable for, transactions processed through third-party integrations you connect to your funnels. You are solely responsible for your own compliance with each connected provider's terms and applicable law (including tax collection on your own sales).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">8. AI Output Disclaimer</h2>
            <p className="mb-4">OfferIQ generates strategic recommendations, pricing suggestions, copy, and marketing assets using artificial intelligence trained on patterns from a broad dataset of funnels. This means:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Outputs are suggestions and drafts, not professional legal, financial, tax, or business advice.</li>
              <li>We do not guarantee that any generated offer, price point, or piece of copy will convert, sell, or perform to any particular standard, including projections referenced in our marketing materials, which are illustrative and not guarantees.</li>
              <li>You are responsible for reviewing, editing, and fact-checking any AI-generated content before publishing it or relying on it, including verifying compliance with advertising, consumer protection, and industry-specific regulations relevant to what you're selling.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">9. Disclaimers & Limitation of Liability</h2>
            <p className="mb-4">To the maximum extent permitted by law:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>OfferIQ is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.</li>
              <li>We do not warrant that the Service will be uninterrupted, error-free, or secure.</li>
              <li>Tendrils Solution's total liability arising out of or related to these Terms or the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.</li>
              <li>We are not liable for indirect, incidental, consequential, special, or punitive damages, including lost profits or lost revenue from your own offers or funnels.</li>
            </ul>
            <p>Some jurisdictions do not allow certain liability limitations, so some of the above may not apply to you.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">10. Indemnification</h2>
            <p>You agree to indemnify and hold Tendrils Solution harmless from claims, damages, and expenses (including reasonable legal fees) arising from: (a) Your Content or the offers/products you sell using OfferIQ; (b) your violation of these Terms; or (c) your violation of any law or third-party right.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">11. Termination</h2>
            <p>We may suspend or terminate your access to OfferIQ if you materially breach these Terms and don't cure the breach after notice (where curable), or immediately for serious violations (e.g., illegal use, fraud, abuse of the Service). You may terminate by cancelling your subscription or deleting your workspace at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">12. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. If changes are material, we'll provide notice (e.g., by email or an in-app notice) before they take effect. Continued use of OfferIQ after changes take effect constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">13. Governing Law</h2>
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law principles, unless otherwise required by applicable local consumer protection law in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">14. Contact</h2>
            <p className="mb-4">Questions about these Terms can be sent to:</p>
            <address className="not-italic bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <strong className="text-[#F5F5F7]">Tendrils Solution</strong><br />
              15b Elder Obed Okocha Close<br />
              Port Harcourt, Nigeria<br />
              <a href="mailto:support@ofiq.app" className="text-[#60A5FA] hover:text-white transition-colors mt-2 inline-block">support@ofiq.app</a>
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
