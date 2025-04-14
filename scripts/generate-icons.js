import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
    // Todos os tamanhos necessários para o PWA
    const sizes = [72, 96, 128, 144, 192, 384, 512];
    const baseIcon = path.join(__dirname, '..', 'src', 'assets', 'base-icon.svg');
    const iconsDir = path.join(__dirname, '..', 'public', 'icons');
    
    // Gerar também ícones de atalho
    const shortcutIcons = [
        { name: 'shortcut-inspection', color: '#2563eb' },
        { name: 'shortcut-reports', color: '#059669' },
        { name: 'shortcut-clients', color: '#7c3aed' }
    ];

    // Certifica que o diretório existe
    await fs.mkdir(iconsDir, { recursive: true });

    // Gerar ícones principais em todos os tamanhos
    for (const size of sizes) {
        try {
            // Gera PNG
            await sharp(baseIcon)
                .resize(size, size)
                .png()
                .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

            console.log(`Ícone ${size}x${size} gerado com sucesso!`);
        } catch (error) {
            console.error(`Erro ao gerar ícone ${size}x${size}:`, error);
        }
    }

    // Gerar ícones de atalho
    for (const shortcut of shortcutIcons) {
        try {
            await sharp(baseIcon)
                .resize(96, 96)
                .png()
                .toFile(path.join(iconsDir, `${shortcut.name}.png`));

            console.log(`Ícone de atalho ${shortcut.name} gerado com sucesso!`);
        } catch (error) {
            console.error(`Erro ao gerar ícone de atalho ${shortcut.name}:`, error);
        }
    }

    // Gerar apple-touch-icon
    try {
        await sharp(baseIcon)
            .resize(180, 180)
            .png()
            .toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'));
        
        console.log('Apple touch icon gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao gerar apple touch icon:', error);
    }

    console.log('Todos os ícones foram gerados com sucesso!');
}

generateIcons().catch(console.error);
