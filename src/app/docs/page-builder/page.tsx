import Link from "next/link";

export const metadata = {
  title: "Page Builder | OfferIQ Docs",
  description: "Learn how to use OfferIQ's Page Builder to design, edit, and publish high-converting landing pages.",
};

export default function PageBuilderPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Build
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Page Builder</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Build and publish conversion-optimized landing pages without writing a line of code. Pages are pre-populated with your AI-generated copy and styled using your Intelligence Report&apos;s Theme Builder settings.
        </p>
      </div>

      {/* What you can build */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What you can build</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: "Lead Capture / Opt-in Page", desc: "Collect email addresses in exchange for a lead magnet, free training, or webinar registration." },
            { name: "Sales Page", desc: "Long-form sales page with your full offer copy, testimonials, pricing, and CTAs." },
            { name: "VSL (Video Sales Letter) Page", desc: "Single-focus page with your video as the hero, designed to keep visitors watching before they can scroll." },
            { name: "Thank You / Confirmation Page", desc: "Post opt-in or post purchase page that delivers the next instruction and sets expectations." },
            { name: "Upsell / One-Time Offer Page", desc: "Presented immediately after a purchase. Time-sensitive offer with a single yes/no decision." },
            { name: "Webinar Registration Page", desc: "Collects registration info and adds urgency through countdown timers and social proof." },
          ].map((item) => (
            <div key={item.name} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <p className="text-white font-medium text-sm mb-1.5">{item.name}</p>
              <p className="text-white/45 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Building your pages</h2>
        <div className="space-y-3">
          {[
            "From your funnel dashboard, click Generate Funnel (from your Intelligence Report) or navigate to Builder in the sidebar.",
            "OfferIQ generates the full page structure based on your funnel blueprint — with all sections pre-populated with your AI copy.",
            "Click any section to open the visual editor panel on the right side.",
            "Edit text directly on the canvas (WYSIWYG). Changes reflect in real time.",
            "Use the section controls to reorder, duplicate, or delete sections.",
            "Click + Add Section to insert new blocks from the section library (hero, testimonial, FAQ, pricing, etc.).",
            "Switch to Preview mode to see exactly how the page will look on desktop and mobile.",
            "When ready, click Publish to make the page live.",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-7 h-7 shrink-0 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                {i + 1}
              </div>
              <p className="text-white/60 text-sm leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customization */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Design customization</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { feature: "Colors & fonts", desc: "Set globally from your Intelligence Report's Theme Builder. Change once, update everywhere." },
              { feature: "Images & media", desc: "Upload your own images or pull from the built-in stock photo library. Drag to replace any placeholder." },
              { feature: "Section library", desc: "50+ pre-built, conversion-tested sections. Insert hero blocks, testimonial carousels, FAQ accordions, countdown timers, and more." },
              { feature: "Mobile preview", desc: "Toggle between desktop and mobile view at any point. All pages are fully responsive by default." },
              { feature: "Custom CSS", desc: "Advanced users can inject custom CSS per-page via the Page Settings panel." },
            ].map((item) => (
              <div key={item.feature} className="px-5 py-4 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-36 shrink-0">{item.feature}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publishing & domains */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Publishing & custom domains</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Every page you publish is instantly live on an OfferIQ subdomain (e.g., <code className="text-white/70 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">yourname.ofiq.app</code>). To use your own domain:
        </p>
        <div className="space-y-3">
          {[
            'Go to Settings → Domains and click "Add Domain".',
            "Enter your custom domain (e.g., salespage.yoursite.com).",
            "OfferIQ provides you with a CNAME record to add at your DNS provider.",
            "Once propagated (usually 5–30 minutes), your page is live on your domain.",
            "SSL is provisioned automatically — no configuration needed.",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-7 h-7 shrink-0 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                {i + 1}
              </div>
              <p className="text-white/60 text-sm leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nav */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/email-sequences" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Email Sequences</Link>
        <Link href="/docs/funnels" className="text-brand-blue hover:text-brand-blue text-sm font-medium transition-colors">Funnel Management →</Link>
      </div>
    </article>
  );
}
