#!/usr/bin/env node

/**
 * Icon Generation Script for QA Checklist PWA
 * 
 * This script creates placeholder icon files for the PWA.
 * In production, you should replace these with actual branded icons.
 */

const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' }
];

// Generate SVG icon template
function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4BAA47;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3a8a37;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#grad)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Checklist icon -->
    <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.4}" height="${size * 0.5}" rx="${size * 0.02}" fill="white" opacity="0.9"/>
    <!-- Checkmarks -->
    <path d="M${size * 0.15} ${size * 0.2} L${size * 0.2} ${size * 0.25} L${size * 0.3} ${size * 0.15}" stroke="white" stroke-width="${size * 0.02}" fill="none"/>
    <path d="M${size * 0.15} ${size * 0.3} L${size * 0.2} ${size * 0.35} L${size * 0.3} ${size * 0.25}" stroke="white" stroke-width="${size * 0.02}" fill="none"/>
    <path d="M${size * 0.15} ${size * 0.4} L${size * 0.2} ${size * 0.45} L${size * 0.3} ${size * 0.35}" stroke="white" stroke-width="${size * 0.02}" fill="none"/>
  </g>
</svg>`;
}

// Create a simple HTML file to convert SVG to PNG (for manual conversion)
function createConversionHTML() {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Icon Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
        .icon-item { text-align: center; border: 1px solid #ddd; padding: 10px; border-radius: 8px; }
        .icon-item svg { max-width: 100px; max-height: 100px; }
        .download-btn { margin-top: 10px; padding: 5px 10px; background: #4BAA47; color: white; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>QA Checklist PWA Icons</h1>
    <p>Right-click on each icon and "Save image as..." to download as PNG files.</p>
    <div class="icon-grid">
        ${iconSizes.map(icon => `
            <div class="icon-item">
                <h3>${icon.name}</h3>
                <div>${generateSVGIcon(icon.size)}</div>
                <p>${icon.size}x${icon.size}px</p>
            </div>
        `).join('')}
    </div>
    
    <script>
        // Add download functionality
        document.querySelectorAll('svg').forEach((svg, index) => {
            svg.addEventListener('click', function() {
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                canvas.width = svg.width.baseVal.value;
                canvas.height = svg.height.baseVal.value;
                
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    const link = document.createElement('a');
                    link.download = '${iconSizes[0].name}'.replace('icon-72x72.png', \`icon-\${canvas.width}x\${canvas.height}.png\`);
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                };
                
                img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            });
        });
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(iconsDir, 'icon-generator.html'), html);
  console.log('✅ Created icon-generator.html - Open this file in a browser to download PNG icons');
}

// Generate individual SVG files
iconSizes.forEach(icon => {
  const svgContent = generateSVGIcon(icon.size);
  const svgPath = path.join(iconsDir, icon.name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
});

// Create the HTML converter
createConversionHTML();

// Create a simple favicon.ico placeholder
const faviconSVG = generateSVGIcon(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSVG);

console.log('✅ Generated SVG icons for all required sizes');
console.log('✅ Created favicon.svg');
console.log('📝 To complete setup:');
console.log('   1. Open public/icons/icon-generator.html in your browser');
console.log('   2. Right-click each icon and save as PNG');
console.log('   3. Replace SVG files with PNG files in public/icons/');
console.log('   4. Convert favicon.svg to favicon.ico using an online converter');
console.log('');
console.log('🎨 For production: Replace with branded Element Cleaning Systems icons');
