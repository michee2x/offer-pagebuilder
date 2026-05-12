const fs = require('fs');

try {
    const content = fs.readFileSync('c:\\Users\\user\\Downloads\\heymessage.framer.ai\\heymessage.framer.ai\\index.html', 'utf-8');

    const urls = content.match(/url\([^)]+\)/g) || [];
    console.log("URLs found:");
    [...new Set(urls)].forEach(u => {
        if (u.toLowerCase().includes('noise') || u.toLowerCase().includes('png') || u.toLowerCase().includes('jpg')) {
            console.log(u);
        }
    });

    const colors = content.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsl\([^)]+\))/g) || [];
    const colorCounts = {};
    colors.forEach(c => { colorCounts[c] = (colorCounts[c] || 0) + 1; });
    console.log("\nMost common colors:");
    Object.entries(colorCounts).sort((a,b) => b[1]-a[1]).slice(0, 40).forEach(([c, count]) =>                                                                                                                                                                                                                                     console.log(`${c}: ${count}`));

    const fonts = content.match(/font-family:\s*[^;"]+/g) || [];
    const fontCounts = {};
    fonts.forEach(c => { fontCounts[c] = (fontCounts[c] || 0) + 1; });
    console.log("\nMost common fonts:");
    Object.entries(fontCounts).sort((a,b) => b[1]-a[1]).slice(0, 5).forEach(([c, count]) => console.log(`${c}: ${count}`));

    const fontSizes = content.match(/font-size:\s*[^;"]+/g) || [];
    const fsCounts = {};
    fontSizes.forEach(c => { fsCounts[c] = (fsCounts[c] || 0) + 1; });
    console.log("\nMost common font sizes:");
    Object.entries(fsCounts).sort((a,b) => b[1]-a[1]).slice(0, 20).forEach(([c, count]) => console.log(`${c}: ${count}`));

    const letterSpacings = content.match(/letter-spacing:\s*[^;"]+/g) || [];
    const lsCounts = {};
    letterSpacings.forEach(c => { lsCounts[c] = (lsCounts[c] || 0) + 1; });
    console.log("\nMost common letter spacings:");
    Object.entries(lsCounts).sort((a,b) => b[1]-a[1]).slice(0, 20).forEach(([c, count]) => console.log(`${c}: ${count}`));
} catch (e) {
    console.error(e);
}
