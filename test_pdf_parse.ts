import fs from 'fs';

// Inject polyfills BEFORE importing pdf-parse
if (typeof (global as any).DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {
    constructor() {}
  };
}
if (typeof (global as any).Path2D === "undefined") {
  (global as any).Path2D = class Path2D {
    constructor() {}
  };
}
if (typeof (global as any).ImageData === "undefined") {
  (global as any).ImageData = class ImageData {
    constructor() {}
  };
}

import pdfParse from 'pdf-parse';

async function test() {
  try {
    const dummyPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n/Kids [3 0 R]\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 5 0 R\n>>\n>>\n>>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000339 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n428\n%%EOF",
      "utf-8"
    );

    const data = await pdfParse(dummyPdf);
    console.log("SUCCESS TEXT:", data.text);
  } catch (e: any) {
    console.error("FAILED:", e.message);
  }
}
test();
