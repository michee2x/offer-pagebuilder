const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:\\', 'Users', 'user', 'Desktop', 'offeriq-builder', 'src');
const macroDir = path.join(srcDir, 'components', 'macro');

const mappings = [
  { oldFile: 'HeroSection.tsx', dir: 'Hero', newFile: 'HeroCenter.tsx', oldName: 'HeroSection', newName: 'HeroCenter' },
  { oldFile: 'FeaturesSection.tsx', dir: 'Features', newFile: 'FeaturesGrid.tsx', oldName: 'FeaturesSection', newName: 'FeaturesGrid' },
  { oldFile: 'TestimonialsSection.tsx', dir: 'Testimonials', newFile: 'TestimonialsGrid.tsx', oldName: 'TestimonialsSection', newName: 'TestimonialsGrid' },
  { oldFile: 'PricingSection.tsx', dir: 'Pricing', newFile: 'PricingCards.tsx', oldName: 'PricingSection', newName: 'PricingCards' },
  { oldFile: 'CTASection.tsx', dir: 'CTA', newFile: 'CTASimple.tsx', oldName: 'CTASection', newName: 'CTASimple' },
];

for (const map of mappings) {
  const cDir = path.join(macroDir, map.dir);
  if (!fs.existsSync(cDir)) {
    fs.mkdirSync(cDir, { recursive: true });
  }

  const oldPath = path.join(macroDir, map.oldFile);
  const newPath = path.join(cDir, map.newFile);

  if (fs.existsSync(oldPath)) {
    let content = fs.readFileSync(oldPath, 'utf8');
    // Rename component and props
    content = content.replace(new RegExp(map.oldName, 'g'), map.newName);
    content = content.replace(new RegExp(map.oldName + 'Props', 'g'), map.newName + 'Props');
    
    // Fix icon imports that might be assuming they are in `macro/` (e.g. `../system/Icon`)
    content = content.replace(/['"]\.\.\/system\/Icon['"]/g, "'../../system/Icon'");
    // micro is at `@/components/micro` so it's fine.
    
    fs.writeFileSync(newPath, content);
    
    // Create index.ts
    const indexContent = `export * from './${map.newFile.replace('.tsx', '')}';\n`;
    fs.writeFileSync(path.join(cDir, 'index.ts'), indexContent);
    
    // Delete old file
    fs.unlinkSync(oldPath);
  }
}

console.log("Macro restructuring complete.");
