// Run with: node scripts/generate-icons.js
// Generates PWA icons as PNG files using sharp or canvas

const fs = require('fs');
const path = require('path');

function generateSVG(size) {
  const fontSize = Math.round(size * 0.28);
  const subFontSize = Math.round(size * 0.08);
  const iconSize = Math.round(size * 0.18);

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5856D6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <text x="${size/2}" y="${size * 0.48}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">H</text>
  <rect x="${size * 0.2}" y="${size * 0.58}" width="${size * 0.6}" height="${Math.round(size * 0.015)}" rx="${Math.round(size * 0.007)}" fill="rgba(255,255,255,0.5)"/>
  <text x="${size/2}" y="${size * 0.72}" font-family="system-ui, -apple-system, sans-serif" font-size="${subFontSize}" font-weight="500" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">OUSING</text>
</svg>`;
}

const sizes = [192, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = generateSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Generated icon-${size}x${size}.svg`);
});

// Also generate favicon SVG
const faviconSVG = generateSVG(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), generateSVG(512));
console.log('Generated favicon.svg');

// Generate apple-touch-icon
const appleSVG = generateSVG(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleSVG);
console.log('Generated apple-touch-icon.svg');
