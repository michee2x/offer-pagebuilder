import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | OfferIQ',
  description: 'Privacy Policy for OfferIQ',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#08080D] text-[#A6A6B3] py-20 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#60A5FA] hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#F5F5F7] mb-6 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-[#60A5FA] font-mono mb-12">Last updated: 17/07/2026</p>

        <div className="space-y-10 text-[16px] leading-relaxed">
          <section>
            <p>
              This Privacy Policy explains how Tendrils Solution ("Tendrils Solution," "we," "us," or "our") collects, uses, discloses, and protects information when you use OfferIQ, available at ofiq.app (the "Service").
            </p>
            <p className="mt-4">
              By using OfferIQ, you agree to the collection and use of information as described in this policy. If you are located in the European Economic Area (EEA), UK, or another jurisdiction with its own data protection framework, additional rights described in Section 7 apply to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">1.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> name, email address, password, business/workspace name, profile photo.</li>
              <li><strong>Billing information:</strong> handled by our payment processor(s) — we do not store full card numbers.</li>
              <li><strong>Offer inputs:</strong> URLs, PDFs, text descriptions, and other materials you upload or paste into OfferIQ to build your offers.</li>
              <li><strong>Content you create:</strong> intelligence reports, copy, funnel pages, email sequences, and other outputs generated in your workspace.</li>
              <li><strong>Leads you collect:</strong> if your published funnels capture opt-ins or purchases, that visitor data (name, email, and any other fields you configure) is stored in your OfferIQ workspace as your data controller responsibility — see Section 1.3.</li>
              <li><strong>Communications:</strong> messages you send us via support, the OfferIQ Agent chat, or elsewhere.</li>
            </ul>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">1.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage data:</strong> pages visited, features used, session duration, click patterns within the Service.</li>
              <li><strong>Device & log data:</strong> IP address, browser type, operating system, referring URLs.</li>
              <li><strong>Cookies and similar technologies:</strong> used for authentication, preferences, and analytics. See Section 5.</li>
              <li><strong>Analytics on published funnels:</strong> page views, unique visitors, conversion events, device breakdown, and traffic quality signals for funnels you publish through OfferIQ.</li>
            </ul>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">1.3 Data From Your Funnel Visitors</h3>
            <p>
              When your funnel visitors submit a lead form or make a purchase, we process that data on your behalf as a data processor, and you act as the data controller for your own leads and customers. You are responsible for having your own privacy notice on your funnel pages and for obtaining any consent required to collect and process that data (e.g., under GDPR or Nigeria's NDPA), and for how you subsequently use that data, including any export to third-party email providers you connect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">2. How We Use Information</h2>
            <p className="mb-4">We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide, operate, and maintain the Service, including generating your intelligence reports, copy, and funnels.</li>
              <li>Process payments and manage subscriptions/credits.</li>
              <li>Provide customer support and respond to inquiries.</li>
              <li>Send service-related communications (billing notices, security alerts, feature updates) and, where you've opted in, marketing communications.</li>
              <li>Monitor and improve the Service, including using aggregated, de-identified usage patterns to refine our AI outputs and product experience.</li>
              <li>Detect, investigate, and prevent fraud, abuse, and security incidents.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">3. How We Share Information</h2>
            <p className="mb-4">We share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service providers</strong> who help us operate OfferIQ, including hosting/infrastructure providers, our payment processor, AI/model providers used to generate outputs, email delivery providers, and analytics tools. These providers are contractually restricted from using your data for their own purposes.</li>
              <li><strong>Third-party integrations</strong> you connect, such as Stripe, PayPal, Mailchimp, ConvertKit, ActiveCampaign, or Zapier. When you connect these, data flows directly between OfferIQ and that provider according to the permissions you grant — governed by that provider's own privacy policy.</li>
              <li><strong>Legal and safety purposes:</strong> if required by law, subpoena, or legal process, or to protect the rights, property, or safety of Tendrils Solution, our users, or the public.</li>
              <li><strong>Business transfers:</strong> if Tendrils Solution is involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction, subject to this policy or a materially similar one.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">4. Data Retention</h2>
            <p className="mb-4">We retain your account data for as long as your account is active. After cancellation or workspace deletion:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Published funnel hosting stops per Section 4.7 of our Terms of Service.</li>
              <li>Underlying data remains available for export for a limited window (see our Data Deletion Policy).</li>
              <li>We may retain limited data longer where required for legal, tax, or fraud-prevention purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">5. Cookies</h2>
            <p className="mb-4">We use cookies and similar technologies for:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Essential functions:</strong> keeping you logged in, remembering workspace preferences.</li>
              <li><strong>Analytics:</strong> understanding how the Service and published funnels are used.</li>
              <li><strong>Marketing</strong> (where applicable): measuring the performance of our own ads, if you've consented.</li>
            </ul>
            <p>You can control cookies through your browser settings. Disabling essential cookies may affect functionality.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">6. Data Security</h2>
            <p>
              We use reasonable technical and organizational measures (encryption in transit, access controls, and similar safeguards) to protect your information. No system is completely secure, and we cannot guarantee absolute security. If you believe your account has been compromised, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">7. Your Rights</h2>
            
            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">7.1 If you are in the EEA/UK (GDPR)</h3>
            <p>
              You have the right to: access your data, correct inaccurate data, request deletion, restrict or object to processing, request portability, and lodge a complaint with your local data protection authority. Our lawful bases for processing include performance of a contract (providing the Service), consent (e.g., marketing), and legitimate interests (e.g., fraud prevention, product improvement).
            </p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">7.2 If you are in Nigeria (NDPA)</h3>
            <p>
              Under the Nigeria Data Protection Act, you have similar rights to access, correction, and deletion of your personal data, and the right to lodge complaints with the Nigeria Data Protection Commission (NDPC).
            </p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">7.3 If you are in California (CCPA/CPRA)</h3>
            <p>
              California residents have the right to know what personal information is collected, request deletion, and opt out of the "sale" or "sharing" of personal information (we do not sell personal information as defined by the CCPA).
            </p>

            <h3 className="text-xl font-medium text-[#F5F5F7] mt-6 mb-3">7.4 Exercising Your Rights</h3>
            <p>
              To exercise any of these rights, contact us at support@ofiq.app. We'll respond within the timeframe required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">8. International Data Transfers</h2>
            <p>
              OfferIQ is operated from Nigeria and may use service providers located in other countries (including the United States and EU). Where we transfer personal data internationally, we take steps to ensure appropriate safeguards are in place, consistent with applicable data protection law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">9. Children's Privacy</h2>
            <p>
              OfferIQ is not directed at, and we do not knowingly collect personal information from, individuals under 18. If we become aware that we've collected information from a child without appropriate consent, we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via email or an in-app notice before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#F5F5F7] mb-4">11. Contact Us</h2>
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
