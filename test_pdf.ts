import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

async function run() {
  try {
    const dummyPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n/Kids [3 0 R]\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 5 0 R\n>>\n>>\n>>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000339 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n428\n%%EOF",
      "utf-8"
    );

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is the text in this PDF?" },
            { type: "file", data: dummyPdf, mimeType: "application/pdf" },
          ],
        },
      ],
    });
    console.log("SUCCESS:", text);
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}
run();
