const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace colors
      content = content.replace(/amber-500/g, 'brand-blue');
      content = content.replace(/amber-400/g, 'brand-blue');
      content = content.replace(/amber-300/g, 'brand-blue');
      content = content.replace(/amber-200/g, 'brand-blue');
      content = content.replace(/orange-500/g, 'brand-purple');
      content = content.replace(/color: "amber"/g, 'color: "blue"');
      content = content.replace(/color === "amber"/g, 'color === "blue"');
      
      content = content.replace(/bg-brand-blue\/\[0\.04\]/g, 'bg-brand-blue/10');
      content = content.replace(/bg-brand-blue\/\[0\.07\]/g, 'bg-brand-blue/10');

      // Remove specific emojis
      const emojisToRemove = ["🚀", "🧠", "✍️", "🏗️", "📈", "⚙️", "💳", "🤖", "⚡", "🔮", "📄", "📧", "🎯", "✨"];
      for (const emoji of emojisToRemove) {
        content = content.split(emoji + " ").join(""); // With space after
        content = content.split(emoji).join(""); // Without space
      }

      fs.writeFileSync(fullPath, content);
      console.log('Processed', fullPath);
    }
  }
}

processDir(path.join(__dirname, 'src', 'app', 'docs'));
