// Generates public/og.png (1200×630) for social sharing.
// Run with: node scripts/generate-og.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fcfcfb"/>
      <stop offset="1" stop-color="#eef1f1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="14" height="630" fill="#0e7490"/>

  <text x="80" y="190" font-family="Arial, 'DejaVu Sans', sans-serif" font-size="22" letter-spacing="3" fill="#0e7490" font-weight="700">UNIVERSITY OF WYOMING · ENERGY &amp; PETROLEUM ENGINEERING</text>
  <text x="78" y="312" font-family="Georgia, 'DejaVu Serif', serif" font-size="90" fill="#1a1c20" font-weight="700">Sheida Sheikheh</text>
  <text x="80" y="364" font-family="Arial, 'DejaVu Sans', sans-serif" font-size="32" fill="#565b66">PhD Candidate · Hydrogen storage &amp; reservoir geomechanics</text>

  <text x="80" y="462" font-family="Georgia, 'DejaVu Serif', serif" font-size="33" fill="#565b66">How the subsurface can safely store hydrogen — from trona</text>
  <text x="80" y="506" font-family="Georgia, 'DejaVu Serif', serif" font-size="33" fill="#565b66">and salt caverns to the geomechanics that keep them stable.</text>

  <text x="80" y="588" font-family="Arial, 'DejaVu Sans', sans-serif" font-size="28" fill="#0e7490" font-weight="700">sheidasheikheh.com</text>
</svg>`;

const base = await sharp(Buffer.from(bg)).png().toBuffer();
const logo = await sharp('public/logo.svg').resize(150, 150).png().toBuffer();
const out = await sharp(base)
  .composite([{ input: logo, top: 70, left: 980 }])
  .png()
  .toBuffer();

writeFileSync(new URL('../public/og.png', import.meta.url), out);
console.log('Wrote public/og.png');
