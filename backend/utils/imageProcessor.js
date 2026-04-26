const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImage(inputPath, outputDir = 'uploads/') {
  const filename = path.basename(inputPath, path.extname(inputPath)) + '.webp';
  const outputPath = path.join(outputDir, filename);

  await sharp(inputPath)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  fs.unlinkSync(inputPath);
  return `/uploads/${filename}`;
}

module.exports = { processImage };