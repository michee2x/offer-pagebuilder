import React from 'react';
import { Card, CardContent } from '@/components/micro';
import { SystemIcon } from '../system/Icon';

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  sectionTitle: string;
  sectionSubtitle?: string;
  features: FeatureItem[];
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeaturesSection({
  sectionTitle,
  sectionSubtitle,
  features = [],
  elementStyles = {},
}: FeaturesSectionProps) {
  return (
    <section className="w-full py-24 px-4 md:px-8 bg-background text-foreground border-b border-border">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="group border border-border bg-card hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${(idx % 3) * 100 + 100}ms` }}
            >
              <CardContent className="p-8 flex flex-col items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary"
                  data-field={`features.${idx}.icon`}
                  style={elementStyles?.[`features.${idx}.icon`]}
                >
                  <SystemIcon name={feature.icon} size={22} />
                </div>
                <h3
                  className="text-xl font-bold"
                  data-field={`features.${idx}.title`}
                  style={elementStyles?.[`features.${idx}.title`]}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-muted-foreground leading-relaxed text-sm"
                  data-field={`features.${idx}.description`}
                  style={elementStyles?.[`features.${idx}.description`]}
                >
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
