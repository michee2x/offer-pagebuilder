import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// A simple helper function to chunk large text into paragraphs
function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph + '\n\n';
    } else {
      currentChunk += paragraph + '\n\n';
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function POST(req: Request) {
  try {
    // 1. Initialize Supabase with the Service Role Key to bypass RLS for data ingestion
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 });
    }

    if (!openAiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Read the knowledge base file automatically
    const fs = await import('fs');
    const path = await import('path');
    const knowledgePath = path.join(process.cwd(), 'src', 'lib', 'support-knowledge.md');
    
    let documentText = '';
    try {
      documentText = fs.readFileSync(knowledgePath, 'utf-8');
    } catch (e) {
      return NextResponse.json({ error: 'Could not find src/lib/support-knowledge.md' }, { status: 404 });
    }

    // 3. Chunk the document
    const chunks = chunkText(documentText);
    console.log(`Processing ${chunks.length} chunks...`);

    // 4. Generate embeddings directly via OpenAI API (Bypasses AI SDK version mismatches)
    const aiRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: chunks,
        model: 'text-embedding-3-small'
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`OpenAI API error: ${errText}`);
    }

    const aiData = await aiRes.json();
    const embeddings = aiData.data.map((d: any) => d.embedding);

    // 5. Prepare data for Supabase
    const rows = chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
      metadata: { source: 'support-knowledge.md' }, // Automatically tagged
    }));

    // 6. Insert into Supabase
    const { error } = await supabase.from('app_documents').insert(rows);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `Successfully embedded and stored ${chunks.length} chunks from support-knowledge.md in Supabase.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error during ingestion:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
