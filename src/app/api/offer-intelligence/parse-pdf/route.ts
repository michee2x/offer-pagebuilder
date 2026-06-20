import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Pdf = Buffer.from(arrayBuffer).toString("base64");

    // Send the PDF directly to Claude — no parsing library needed
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: `You are a sales strategy extractor. Read this document and extract the core offer strategy into a clean, readable summary with key-value pairs. Focus on:
- Offer Name / Title
- Format (course, service, software, etc)
- Outcome / Promise
- Target Audience (Persona)
- Price (if mentioned)
- Unique Mechanism
- Any Proof / Results mentioned

Keep it concise and formatted cleanly so the user can review it. If something is missing, just omit it.`,
            },
          ],
        },
      ],
    });

    const summary =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!summary) {
      return NextResponse.json(
        { error: "Could not extract strategy from PDF." },
        { status: 400 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
