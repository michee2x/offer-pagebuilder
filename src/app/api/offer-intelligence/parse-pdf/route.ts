import './../../../../lib/pdf-polyfills';
import { NextResponse } from "next/server";
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import * as pdfjsLib from 'pdfjs-dist';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    // Use dynamic import with proper error handling
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js').catch(() => 
      require('pdf-parse')
    );
    
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    if (typeof pdfParse !== 'function') {
      throw new Error('pdf-parse module is not a function');
    }

    const data = await pdfParse(buffer);
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF." }, { status: 400 });
    }

    const systemPrompt = `You are a sales strategy extractor. Your job is to read the raw text of a document and extract the core offer strategy into a clean, readable summary with key-value pairs. Focus on:
- Offer Name / Title
- Format (course, service, software, etc)
- Outcome / Promise
- Target Audience (Persona)
- Price (if mentioned)
- Unique Mechanism
- Any Proof / Results mentioned

Keep it concise and formatted cleanly so the user can review it.`;

    const { text: summary } = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      system: systemPrompt,
      prompt: `Extract the offer strategy from this document text. If something is missing, just omit it.\n\nDOCUMENT TEXT:\n${text.substring(0, 50000)}`,
    });

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: error.message || "Failed to parse PDF" }, { status: 500 });
  }
}