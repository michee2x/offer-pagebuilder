const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\heymessage.framer.ai\\heymessage.framer.ai\\index.html', 'utf-8');

// Find all cubic-bezier and spring transition strings
const beziers = content.match(/cubic-bezier\([^)]+\)/g) || [];
const bezierCounts = {};
beziers.forEach(b => { bezierCounts[b] = (bezierCounts[b] || 0) + 1; });
console.log("Common Beziers:");
Object.entries(bezierCounts).sort((a,b) => b[1]-a[1]).slice(0, 5).forEach(x => console.log(x));

// Look for transition durations
const durations = content.match(/transition:[^;]+;/g) || [];
const durCounts = {};
durations.forEach(d => { durCounts[d] = (durCounts[d] || 0) + 1; });
console.log("\nCommon Transitions:");
Object.entries(durCounts).sort((a,b) => b[1]-a[1]).slice(0, 10).forEach(x => console.log(x));

// Look for framer-appear animation keyframes
const keyframes = content.match(/@keyframes[^{]+\{[\s\S]+?\}/g) || [];
console.log("\nKeyframes:");
keyframes.slice(0, 3).forEach(x => console.log(x.substring(0, 200) + '...'));
