// frontend/generate-icons.js
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateIcons() {
  const sizes = [192, 512];
  
  try {
    console.log('Starting icon generation...');
    for (const size of sizes) {
      console.log(`Generating ${size}x${size} icon...`);
      await sharp(join(__dirname, 'public', 'rat-icon.svg'))
        .resize(size, size)
        .png()
        .toFile(join(__dirname, 'public', `pwa-${size}x${size}.png`));
    }
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();