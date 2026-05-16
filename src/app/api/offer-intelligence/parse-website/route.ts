import { NextResponse } from "next/server";
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import * as cheerio from 'cheerio';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Fetch the website content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and noscript tags to clean up the text
    $('script, style, noscript, iframe, img, svg, video').remove();

    // Extract text
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    if (!text || text.length === 0) {
      return NextResponse.json({ error: "Could not extract readable text from the website." }, { status: 400 });
    }

    // Call LLM to summarize and format
    const systemPrompt = `You are a sales strategy extractor. Your job is to read the raw text scraped from a sales page or business website and extract the core offer strategy into a clean, readable summary with key-value pairs. Focus on:
- Offer Name / Title
- Format (course, service, software, etc)
- Outcome / Promise
- Target Audience (Persona)
- Price (if mentioned)
- Unique Mechanism
- Any Proof / Results mentioned

Keep it concise and formatted cleanly so the user can review it.`;

    const { text: summary } = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'), // Using 3.5 Sonnet for fast, high-quality extraction
      system: systemPrompt,
      prompt: `Extract the offer strategy from this website text. If something is missing, just omit it.\n\nWEBSITE URL: ${url}\n\nWEBSITE TEXT:\n${text.substring(0, 50000)}`, // Limiting length
    });

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error parsing website:", error);
    return NextResponse.json({ error: error.message || "Failed to parse website" }, { status: 500 });
  }
}
