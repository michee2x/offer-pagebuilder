import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge, Separator } from '@/components/micro';
import { SystemIcon } from '../../system/Icon';

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: { text: string }[];
  isPopular?: boolean;
  buttonText: string;
}

export interface PricingCardsProps {
  sectionTitle: string;
  sectionSubtitle?: string;
  tiers: PricingTier[];
  sectionId?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function PricingCards({
  sectionTitle,
  sectionSubtitle,
  tiers = [],
  sectionId = '',
  elementStyles = {},
}: PricingCardsProps) {
  return (
    <section id={sectionId || undefined} className="w-full py-24 px-4 md:px-8 bg-background text-foreground border-b border-border scroll-mt-24">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16 animate-fade-in-up">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            data-field="sectionTitle"
            style={elementStyles?.['sectionTitle']}
          >
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p
              className="text-xl max-w-2xl mx-auto text-muted-foreground"
              data-field="sectionSubtitle"
              style={elementStyles?.['sectionSubtitle']}
            >
              {sectionSubtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6">
          {tiers.map((tier, idx) => (
            <Card
              key={idx}
              className={`flex-1 flex flex-col relative border transition-all duration-300 animate-fade-in-up hover:shadow-2xl ${
                tier.isPopular
                  ? 'border-primary shadow-lg shadow-primary/10 scale-[1.03] z-10'
                  : 'border-border'
              }`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="p-8 pb-4">
                <CardTitle
                  className="text-2xl font-semibold"
                  data-field={`tiers.${idx}.name`}
                  style={elementStyles?.[`tiers.${idx}.name`]}
                >
                  {tier.name}
                </CardTitle>
                <CardDescription
                  data-field={`tiers.${idx}.description`}
                  style={elementStyles?.[`tiers.${idx}.description`]}
                >
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pt-0 pb-6 flex flex-col flex-1 gap-6">
                <div
                  className="text-5xl font-bold text-foreground"
                  data-field={`tiers.${idx}.price`}
                  style={elementStyles?.[`tiers.${idx}.price`]}
                >
                  {tier.price}
                </div>

                <Separator />

                <ul className="flex-1 space-y-3">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <SystemIcon
                        name="CheckCircle2"
                        size={16}
                        className="text-primary mt-0.5 shrink-0"
                      />
                      <span
                        className="text-muted-foreground leading-relaxed"
                        data-field={`tiers.${idx}.features.${i}.text`}
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-8 pb-8">
                <Button
                  className="w-full py-5 font-bold text-base"
                  variant={tier.isPopular ? 'default' : 'outline'}
                  data-field={`tiers.${idx}.buttonText`}
                  style={elementStyles?.[`tiers.${idx}.buttonText`]}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
