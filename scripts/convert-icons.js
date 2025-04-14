// Script para converter ícones SVG para PNG
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';
import { JSDOM } from 'jsdom';
import { Resvg } from '@resvg/resvg-js';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const iconsDir = path.join(rootDir, 'public', 'icons');

// Verificar se o diretório existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
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

// Função para criar ícone padrão se não existir
function createDefaultIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fundo branco
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, size, size);
  
  // Círculo azul
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Letra B
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
}

// Tamanhos de ícones necessários para PWA
const iconSizes = [72, 96, 128, 144, 192, 384, 512];

// Converter os ícones de atalho
const shortcuts = [
  { name: 'shortcut-inspection', size: 96 },
  { name: 'shortcut-reports', size: 96 },
  { name: 'shortcut-clients', size: 96 }
];

// Processar ícones de atalho
for (const shortcut of shortcuts) {
  const svgPath = path.join(iconsDir, `${shortcut.name}.svg`);
  const pngPath = path.join(iconsDir, `${shortcut.name}.png`);
  
  if (fs.existsSync(svgPath)) {
    await convertSvgToPng(svgPath, pngPath, shortcut.size, shortcut.size);
  }
}

// Processar ícones principais
for (const size of iconSizes) {
  const iconName = `icon-${size}x${size}`;
  const svgPath = path.join(iconsDir, `${iconName}.svg`);
  const pngPath = path.join(iconsDir, `${iconName}.png`);
  
  // Verificar se o SVG existe
  if (fs.existsSync(svgPath)) {
    await convertSvgToPng(svgPath, pngPath, size, size);
  } else {
    // Criar ícone padrão se não existir
    console.log(`Criando ícone padrão: ${pngPath}`);
    const pngBuffer = createDefaultIcon(size);
    fs.writeFileSync(pngPath, pngBuffer);
  }
}

// Criar badge para notificações
const badgePath = path.join(iconsDir, 'badge-72x72.png');
if (!fs.existsSync(badgePath)) {
  console.log(`Criando badge: ${badgePath}`);
  const canvas = createCanvas(72, 72);
  const ctx = canvas.getContext('2d');
  
  // Círculo azul
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(36, 36, 36, 0, Math.PI * 2);
  ctx.fill();
  
  // Letra B
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', 36, 36);
  
  fs.writeFileSync(badgePath, canvas.toBuffer('image/png'));
}

console.log('Conversão de ícones concluída!');
