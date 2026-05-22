// Rasterize the SVG logo to PNG icons. Run from the project root:
//   node scripts/generate-logo.mjs
import sharp from 'sharp';

const outputs = [
  ['public/logo.png', 512],
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
];

for (const [file, size] of outputs) {
  await sharp('public/logo.svg').resize(size, size).png().toFile(file);
}

console.log('Wrote: ' + outputs.map(([f]) => f).join(', '));
