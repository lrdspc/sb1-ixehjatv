import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
    const sizes = [192, 512];
    const baseIcon = path.join(__dirname, '..', 'src', 'assets', 'base-icon.svg');
    const iconsDir = path.join(__dirname, '..', 'public', 'icons');

    // Certifica que o diretório existe
    await fs.mkdir(iconsDir, { recursive: true });

    for (const size of sizes) {
        // Gera PNG
        await sharp(baseIcon)
            .resize(size, size)
            .png()
            .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

        // Copia SVG com o tamanho correto
        const svgContent = await fs.readFile(baseIcon, 'utf-8');
        const newSvgContent = svgContent
            .replace('width="512"', `width="${size}"`)
            .replace('height="512"', `height="${size}"`);
        await fs.writeFile(
            path.join(iconsDir, `icon-${size}x${size}.svg`),
            newSvgContent
        );
    }

    console.log('Ícones gerados com sucesso!');
}

generateIcons().catch(console.error);
