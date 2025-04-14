// Script para converter screenshots SVG para PNG
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';
import { Resvg } from '@resvg/resvg-js';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const screenshotsDir = path.join(rootDir, 'public', 'screenshots');

// Verificar se o diretório existe
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Função para converter SVG para PNG
async function convertSvgToPng(svgPath, pngPath, width, height) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Usar resvg para renderizar SVG para PNG
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: width
      }
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    fs.writeFileSync(pngPath, pngBuffer);
    console.log(`Convertido: ${svgPath} -> ${pngPath}`);
  } catch (error) {
    console.error(`Erro ao converter ${svgPath}:`, error);
  }
}

// Screenshots para converter
const screenshots = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'mobile', width: 750, height: 1334 }
];

// Processar screenshots
for (const screenshot of screenshots) {
  const svgPath = path.join(screenshotsDir, `${screenshot.name}.svg`);
  const pngPath = path.join(screenshotsDir, `${screenshot.name}.png`);
  
  if (fs.existsSync(svgPath)) {
    await convertSvgToPng(svgPath, pngPath, screenshot.width, screenshot.height);
  } else {
    console.warn(`Arquivo SVG não encontrado: ${svgPath}`);
  }
}

console.log('Conversão de screenshots concluída!');
