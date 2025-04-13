import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to create a simple icon as a data URL
function createIconDataURL(size) {
  // This is a very basic representation of an icon as a data URL
  // It's a blue circle with a white 'B' in the middle
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="white"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.4}" fill="#2563eb"/>
  <text x="${size/2}" y="${size/2 + size*0.05}" font-family="Arial" font-size="${size*0.5}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">B</text>
</svg>
  `.trim();
}

// Save the SVG files
const sizes = [192, 512];
sizes.forEach(size => {
  const svgContent = createIconDataURL(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${filePath}`);
});

console.log('Icon SVGs created successfully. Convert these to PNG files and place them in the public/icons directory.');
