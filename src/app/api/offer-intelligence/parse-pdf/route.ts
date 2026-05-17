import { NextResponse } from "next/server";
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { PDFParse } from 'pdf-parse';

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

    // Parse the PDF using new pdf-parse class API
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF." }, { status: 400 });
    }

    // Call LLM to summarize and format
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
      model: anthropic('claude-3-5-sonnet-20240620'), // Using 3.5 Sonnet for fast, high-quality extraction
      system: systemPrompt,
      prompt: `Extract the offer strategy from this document text. If something is missing, just omit it.\n\nDOCUMENT TEXT:\n${text.substring(0, 50000)}`, // Limiting length just in case
    });

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: error.message || "Failed to parse PDF" }, { status: 500 });
  }
}
