import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  LevelFormat,
} from "docx";

/**
 * Structured content types for building a DOCX document.
 * The AI generates this JSON structure, which we convert to a real .docx file.
 */
export interface DocxSection {
  heading?: string;
  headingLevel?: 1 | 2 | 3;
  paragraphs?: string[];
  bullets?: string[];
  numberedList?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface DocxContent {
  title: string;
  subtitle?: string;
  sections: DocxSection[];
}

// Brand colors
const BRAND_INDIGO = "6366F1";
const DARK_BG = "1E1E2E";
const LIGHT_TEXT = "333333";
const MUTED_TEXT = "666666";
const TABLE_HEADER_BG = "EEF2FF";
const TABLE_BORDER = "E0E0E0";

/**
 * Build a professional .docx file from structured content.
 * Returns a Buffer ready for upload to Supabase Storage.
 */
export async function buildDocx(content: DocxContent): Promise<Buffer> {
  // Must be (Paragraph | Table)[] — the docx library accepts both at the section level
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: content.title,
          bold: true,
          size: 56, // 28pt
          color: BRAND_INDIGO,
          font: "Calibri",
        }),
      ],
      spacing: { after: 120 },
      alignment: AlignmentType.LEFT,
    })
  );

  // Subtitle
  if (content.subtitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: content.subtitle,
            size: 24, // 12pt
            color: MUTED_TEXT,
            font: "Calibri",
            italics: true,
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  // Divider line (empty paragraph with bottom border)
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "" })],
      spacing: { after: 300 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_INDIGO },
      },
    })
  );

  // Sections
  for (const section of content.sections) {
    // Section heading
    if (section.heading) {
      const level = section.headingLevel || 2;
      const headingMap: any = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
      };

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading,
              bold: true,
              size: level === 1 ? 44 : level === 2 ? 32 : 26,
              color: level === 1 ? BRAND_INDIGO : LIGHT_TEXT,
              font: "Calibri",
            }),
          ],
          heading: headingMap[level],
          spacing: { before: 360, after: 160 },
        })
      );
    }

    // Paragraphs
    if (section.paragraphs) {
      for (const para of section.paragraphs) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: para,
                size: 22, // 11pt
                color: LIGHT_TEXT,
                font: "Calibri",
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    }

    // Bullet list
    if (section.bullets) {
      for (const bullet of section.bullets) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: bullet,
                size: 22,
                color: LIGHT_TEXT,
                font: "Calibri",
              }),
            ],
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      }
      // Add spacing after bullet list
      children.push(new Paragraph({ children: [], spacing: { after: 120 } }));
    }

    // Numbered list
    if (section.numberedList) {
      for (let i = 0; i < section.numberedList.length; i++) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.numberedList[i],
                size: 22,
                color: LIGHT_TEXT,
                font: "Calibri",
              }),
            ],
            numbering: { reference: "default-numbering", level: 0 },
            spacing: { after: 80 },
          })
        );
      }
      children.push(new Paragraph({ children: [], spacing: { after: 120 } }));
    }

    // Table
    if (section.table && section.table.headers.length > 0) {
      const columnCount = section.table.headers.length;

      // Header row
      const headerRow = new TableRow({
        children: section.table.headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      bold: true,
                      size: 20,
                      color: BRAND_INDIGO,
                      font: "Calibri",
                    }),
                  ],
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                fill: TABLE_HEADER_BG,
                color: TABLE_HEADER_BG,
              },
              width: {
                size: Math.floor(100 / columnCount),
                type: WidthType.PERCENTAGE,
              },
            })
        ),
        tableHeader: true,
      });

      // Data rows
      const dataRows = section.table.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          size: 20,
                          color: LIGHT_TEXT,
                          font: "Calibri",
                        }),
                      ],
                    }),
                  ],
                  width: {
                    size: Math.floor(100 / columnCount),
                    type: WidthType.PERCENTAGE,
                  },
                })
            ),
          })
      );

      const table = new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });

      // Add a spacer paragraph, then the table, then another spacer
      children.push(new Paragraph({ children: [] }));
      children.push(table);
      children.push(new Paragraph({ children: [], spacing: { after: 200 } }));
    }
  }

  // Build the document
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: LIGHT_TEXT,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
