// Rasterize the SVG logo to PNGs. Run from the project root:
//   node scripts/generate-logo.mjs
import sharp from 'sharp';

await sharp('public/logo.svg').resize(512, 512).png().toFile('public/logo.png');
await sharp('public/logo.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');

console.log('Wrote public/logo.png (512x512) and public/apple-touch-icon.png (180x180)');
