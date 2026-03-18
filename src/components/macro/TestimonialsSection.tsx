import React from 'react';
import { Card, CardContent, Avatar, AvatarFallback } from '@/components/micro';

export interface TestimonialItem {
  quote: string;
  name: string;
  role?: string;
  stars: number;
}

export interface TestimonialsSectionProps {
  sectionTitle: string;
  testimonials: TestimonialItem[];
  elementStyles?: Record<string, React.CSSProperties>;
}

export function TestimonialsSection({
  sectionTitle,
  testimonials = [],
  elementStyles = {},
}: TestimonialsSectionProps) {
  return (
    <section className="w-full py-24 px-4 md:px-8 bg-muted/30 text-foreground border-b border-border overflow-hidden">
      <div className="max-w-6xl mx-auto">

        <h2
          className="text-4xl md:text-5xl font-bold mb-16 text-center"
          data-field="sectionTitle"
          style={elementStyles?.['sectionTitle']}
        >
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className="bg-card border border-border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <CardContent className="p-8 flex flex-col h-full gap-4">

                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(t.stars || 5, 5) }).map((_, s) => (
                    <svg key={s} className="w-4 h-4 fill-primary text-primary" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-base italic text-muted-foreground leading-relaxed flex-1"
                  data-field={`testimonials.${i}.quote`}
                  style={elementStyles?.[`testimonials.${i}.quote`]}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                      {t.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4
                      className="font-semibold text-sm"
                      data-field={`testimonials.${i}.name`}
                      style={elementStyles?.[`testimonials.${i}.name`]}
                    >
                      {t.name}
                    </h4>
                    {t.role && (
                      <p
                        className="text-xs text-muted-foreground"
                        data-field={`testimonials.${i}.role`}
                        style={elementStyles?.[`testimonials.${i}.role`]}
                      >
                        {t.role}
                      </p>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
