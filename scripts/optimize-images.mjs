/**
 * optimize-images.mjs
 * Converts PNG assets to WebP for significant transfer size savings.
 *
 * Card images: max-width 900px (displayed at ~734px), quality 82
 * 3D icons:    140×140 (displayed at 70px, 2× for retina), quality 82
 *
 * Run once: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CARD_IMGS_DIR = join(ROOT, 'public', 'card-imgs');
const ICONS_DIR     = join(ROOT, 'public', '3d-icons');

async function convertDir({ dir, maxWidth, maxHeight, quality, label }) {
  const files = await readdir(dir);
  const pngs = files.filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`\n📂  ${label} — ${pngs.length} PNG(s) found`);

  for (const file of pngs) {
    const src  = join(dir, file);
    const dest = join(dir, file.replace(/\.png$/i, '.webp'));

    // Skip if WebP already exists
    try {
      await access(dest);
      console.log(`  ⏭️  Skip (already exists): ${file.replace(/\.png$/i, '.webp')}`);
      continue;
    } catch {
      // File doesn't exist — proceed
    }

    const pipeline = sharp(src);

    if (maxWidth && maxHeight) {
      pipeline.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });
    } else if (maxWidth) {
      pipeline.resize(maxWidth, null, { withoutEnlargement: true });
    }

    pipeline.webp({ quality });

    const info = await pipeline.toFile(dest);
    const srcStat = (await import('fs')).statSync(src);
    const saving = (((srcStat.size - info.size) / srcStat.size) * 100).toFixed(1);

    console.log(
      `  ✅  ${file.padEnd(50)} ${(srcStat.size / 1024).toFixed(0).padStart(6)} KB → ${(info.size / 1024).toFixed(0).padStart(5)} KB  (${saving}% smaller)`
    );
  }
}

async function main() {
  console.log('🚀  OfferIQ Image Optimiser — PNG → WebP\n');

  await convertDir({
    dir: CARD_IMGS_DIR,
    maxWidth: 900,
    maxHeight: null,
    quality: 82,
    label: 'Card Images (max-width 900px)',
  });

  await convertDir({
    dir: ICONS_DIR,
    maxWidth: 140,
    maxHeight: 140,
    quality: 82,
    label: '3D Icons (140×140)',
  });

  console.log('\n✨  Done! Update your <img> src attributes to use the .webp variants.\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
