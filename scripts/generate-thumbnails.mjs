import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const components = [
  'PricingCards', 'HeyMessageHeader', 'HeyMessageFeatures', 'HeyMessageSplit',
  'HeyMessageFAQ', 'HeyMessageCTA', 'HeyMessageFooter', 'FeatureHeader', 'FeatureHero', 'HeroCenter',
  'FeatureLogos', 'FeatureTestimonials', 'FeatureFAQ', 'FeaturePricing', 'FeatureCTA', 'FeaturesGrid',
  'FeatureSplit', 'FeatureFooter'
];

async function generate() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // High-dpi compact screenshot
  await page.setViewport({ width: 1000, height: 750, deviceScaleFactor: 2 });

  const outDir = path.join(process.cwd(), 'public', 'thumbnails');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const comp of components) {
    console.log(`Capturing ${comp}...`);
    await page.goto(`http://localhost:3000/thumbnail-generator?type=${comp}`, { waitUntil: 'networkidle0' });
    
    const element = await page.$('#capture-area');
    if (element) {
      // Force element to expand to viewport width
      await page.evaluate(() => {
        const el = document.getElementById('capture-area');
        if (el) el.style.width = '1000px';
      });
      // Allow framer motion / CSS animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await element.screenshot({ path: path.join(outDir, `${comp}.webp`), type: 'webp', quality: 60 });
      console.log(`Saved ${comp}.webp`);
    } else {
      console.log(`Skipped ${comp} - No capture area found`);
    }
  }

  await browser.close();
  console.log('Finished generating thumbnails!');
}

generate().catch(console.error);
