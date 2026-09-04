import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcImage = './src/assets/images/pwa_app_icon_1788542609376.jpg';

async function generateIcons() {
  if (!fs.existsSync(srcImage)) {
    console.error('Source image not found at', srcImage);
    process.exit(1);
  }

  const publicDir = './public';
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. pwa-192x192.png
  await sharp(srcImage)
    .resize(192, 192, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. pwa-512x512.png
  await sharp(srcImage)
    .resize(512, 512, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(srcImage)
    .resize(180, 180, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 4. pwa-maskable-512x512.png (512x512 with 15% inner padding for Android squircles/circles)
  const innerSize = Math.round(512 * 0.75); // 384px inner icon
  const paddedIcon = await sharp(srcImage)
    .resize(innerSize, innerSize, { fit: 'cover' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 6, g: 30, b: 23, alpha: 1 } // #061e17 dark emerald theme background
    }
  })
    .composite([{ input: paddedIcon, gravity: 'center' }])
    .toFormat('png')
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 5. icon.svg
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#061e17"/>
  <path d="M256 120 C 230 120, 210 140, 210 166 L 210 280 C 210 305, 230 325, 256 325 C 282 325, 302 305, 302 280 L 302 166 C 302 140, 282 120, 256 120 Z" fill="none" stroke="#10b981" stroke-width="24" stroke-linecap="round"/>
  <path d="M160 220 L 160 270 C 160 323, 203 366, 256 366 C 309 366, 352 323, 352 270 L 352 220" fill="none" stroke="#34d399" stroke-width="24" stroke-linecap="round"/>
  <path d="M256 366 L 256 420 M 216 420 L 296 420" fill="none" stroke="#34d399" stroke-width="24" stroke-linecap="round"/>
  <circle cx="256" cy="190" r="18" fill="#6ee7b7"/>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
  console.log('Generated icon.svg');
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
