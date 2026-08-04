import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard search engine crawlers — full access
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/builder/', '/admin/'],
      },
      // Google AI — allow full indexing for AI Overviews
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      // OpenAI / ChatGPT — allow for GEO discovery
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      // Perplexity AI — allow for GEO discovery
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      // Anthropic / Claude — allow for GEO discovery
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
    ],
    sitemap: 'https://www.ofiq.app/sitemap.xml',
  };
}
