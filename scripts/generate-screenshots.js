import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateScreenshots() {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  
  // Certifica que o diretório existe
  await fs.mkdir(screenshotsDir, { recursive: true });
  
  // Configurações para os screenshots
  const screenshots = [
    {
      name: 'desktop',
      width: 1280,
      height: 720,
      type: 'wide'
    },
    {
      name: 'mobile',
      width: 750,
      height: 1334,
      type: 'narrow'
    }
  ];
  
  for (const screenshot of screenshots) {
    try {
      // Criar canvas com as dimensões do screenshot
      const canvas = createCanvas(screenshot.width, screenshot.height);
      const ctx = canvas.getContext('2d');
      
      // Preencher com cor de fundo
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, screenshot.width, screenshot.height);
      
      // Adicionar cabeçalho
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(0, 0, screenshot.width, screenshot.type === 'wide' ? 80 : 60);
      
      // Carregar e desenhar logo
      try {
        const logoPath = path.join(__dirname, '..', 'src', 'assets', 'logo.png');
        const logo = await loadImage(logoPath);
        const logoSize = screenshot.type === 'wide' ? 160 : 100;
        const logoX = screenshot.type === 'wide' ? 40 : 20;
        const logoY = screenshot.type === 'wide' ? 100 : 80;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize * (logo.height / logo.width));
      } catch (logoError) {
        // Se não conseguir carregar o logo, desenhar um placeholder
        ctx.fillStyle = '#2563eb';
        ctx.font = screenshot.type === 'wide' ? 'bold 40px sans-serif' : 'bold 30px sans-serif';
        ctx.fillText('Brasilit', screenshot.type === 'wide' ? 40 : 20, screenshot.type === 'wide' ? 160 : 120);
      }
      
      // Desenhar título
      ctx.fillStyle = '#1f2937';
      ctx.font = screenshot.type === 'wide' ? 'bold 32px sans-serif' : 'bold 24px sans-serif';
      ctx.fillText('Sistema de Vistorias', 
                  screenshot.type === 'wide' ? 40 : 20, 
                  screenshot.type === 'wide' ? 240 : 180);
      
      // Desenhar cards de exemplo (simulando conteúdo)
      const cardWidth = screenshot.type === 'wide' ? 300 : screenshot.width - 40;
      const cardHeight = 120;
      const cardSpacing = 20;
      const startY = screenshot.type === 'wide' ? 300 : 220;
      
      for (let i = 0; i < 3; i++) {
        const cardX = screenshot.type === 'wide' ? 40 + i * (cardWidth + cardSpacing) : 20;
        const cardY = screenshot.type === 'wide' ? startY : startY + i * (cardHeight + cardSpacing);
        
        // Desenhar card
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
        ctx.shadowColor = 'transparent';
        
        // Título do card
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(['Nova Vistoria', 'Relatórios', 'Clientes'][i], cardX + 15, cardY + 30);
        
        // Conteúdo do card
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.fillText('Última atualização: 14/04/2025', cardX + 15, cardY + 60);
        
        // Barra de progresso
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(cardX + 15, cardY + 80, cardWidth - 30, 8);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(cardX + 15, cardY + 80, (cardWidth - 30) * [0.7, 0.5, 0.9][i], 8);
      }
      
      // Salvar a imagem
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(path.join(screenshotsDir, `${screenshot.name}.png`), buffer);
      
      console.log(`Screenshot ${screenshot.name}.png gerado com sucesso!`);
    } catch (error) {
      console.error(`Erro ao gerar screenshot ${screenshot.name}:`, error);
    }
  }
  
  console.log('Todos os screenshots foram gerados com sucesso!');
}

generateScreenshots().catch(console.error);
