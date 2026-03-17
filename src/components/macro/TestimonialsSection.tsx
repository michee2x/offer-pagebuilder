import React from 'react';

export interface TestimonialItem {
  quote: string;
  name: string;
  role?: string;
  stars: number;
}

export interface TestimonialsSectionProps {
  sectionTitle: string;
  testimonials: TestimonialItem[];
}

export function TestimonialsSection({ sectionTitle, testimonials = [] }: TestimonialsSectionProps) {
  return (
    <section 
      className="w-full py-24 px-4 md:px-8 border-b overflow-hidden"
      style={{ 
        backgroundColor: 'var(--theme-surface)', 
        color: 'var(--theme-text)',
        borderColor: 'var(--theme-border)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 animate-fade-in-up">
          {sectionTitle}
        </h2>

        <div className="flex flex-wrap justify-center gap-6">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="w-full max-w-sm p-8 rounded-2xl border flex flex-col justify-between hover:shadow-lg transition-shadow bg-opacity-50 animate-fade-in-up"
              style={{ 
                backgroundColor: 'var(--theme-bg)',
                borderColor: 'var(--theme-border)',
                animationDelay: `${idx * 150}ms`
              }}
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < t.stars ? '' : 'opacity-20'}`} style={{ color: 'var(--theme-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg italic mb-8" style={{ color: 'var(--theme-text-muted)' }}>
                  "{t.quote}"
                </blockquote>
              </div>
              
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ 
                    backgroundColor: 'var(--theme-primary)', 
                    color: 'var(--theme-primary-fg)' 
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  {t.role && <div className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t.role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
