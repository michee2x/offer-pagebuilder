const sharp = require("sharp");
const path = require("path");

const inputPath = path.join(__dirname, "public", "og-image.png");
const outputPath = path.join(__dirname, "public", "og-image-resized.png");

async function resizeImage() {
  try {
    await sharp(inputPath)
      .resize({
        width: 1200,
        height: 630,
        fit: "contain",
        background: { r: 5, g: 5, b: 5, alpha: 1 } // #050505 to match site background
      })
      .toFile(outputPath);
    console.log("Successfully resized image to 1200x630 with #050505 padding.");
  } catch (err) {
    console.error("Error resizing image:", err);
  }
}

resizeImage();
