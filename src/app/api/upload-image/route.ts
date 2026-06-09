import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

const BUCKET_NAME = 'page-images';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALL_ALLOWED_MIMES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50 MB

function getFileMediaType(file: File): 'image' | 'video' | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

function getMediaTypeFromName(name: string): 'image' | 'video' | 'unknown' {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'unknown';
}

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_VIDEO_SIZE, // Use the larger limit; we enforce per-type in code
      allowedMimeTypes: ALL_ALLOWED_MIMES,
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mediaType = getFileMediaType(file);
    if (!mediaType) {
      return NextResponse.json({ error: 'File must be an image or video' }, { status: 400 });
    }

    const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maxLabel = mediaType === 'video' ? '50 MB' : '10 MB';
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${maxLabel})` }, { status: 400 });
    }

    const supabase = createAdminClient();
    await ensureBucket(supabase);

    // Generate a unique filename while preserving the extension
    const ext = file.name.split('.').pop()?.toLowerCase() || (mediaType === 'video' ? 'mp4' : 'jpg');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl, type: mediaType });
  } catch (err: any) {
    console.error('[upload-image]', err);
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Return empty gracefully if bucket doesn't exist yet
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) return NextResponse.json({ files: [] });

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 60, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) return NextResponse.json({ files: [] });

    const files = (data ?? [])
      .filter((f) => f.name !== '.emptyFolderPlaceholder')
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from(BUCKET_NAME).getPublicUrl(f.name).data.publicUrl,
        type: getMediaTypeFromName(f.name),
      }));

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
