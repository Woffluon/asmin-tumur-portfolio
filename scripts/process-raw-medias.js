import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const RAW_DIR = path.resolve('raw-medias');
const PUBLIC_MEDIAS_DIR = path.resolve('public/medias');

// Ensure directories exist
if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_MEDIAS_DIR)) {
  fs.mkdirSync(PUBLIC_MEDIAS_DIR, { recursive: true });
}

async function processImages() {
  const files = fs.readdirSync(RAW_DIR).filter(file => /\.(jpe?g|png|webp|tiff|avif)$/i.test(file));
  
  if (files.length === 0) {
    console.log('No raw images found in raw-medias/ directory.');
    return;
  }

  console.log(`Found ${files.length} raw image(s) to process...`);

  for (const file of files) {
    const filePath = path.join(RAW_DIR, file);
    const filenameNoExt = path.parse(file).name;

    console.log(`Processing: ${file}...`);

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // 1. Desktop (Max width 1920)
      const desktopWebpPath = path.join(PUBLIC_MEDIAS_DIR, `${filenameNoExt}.webp`);
      const desktopAvifPath = path.join(PUBLIC_MEDIAS_DIR, `${filenameNoExt}.avif`);
      
      await sharp(filePath)
        .resize({ width: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 92, effort: 6 })
        .toFile(desktopWebpPath);

      await sharp(filePath)
        .resize({ width: 1920, fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 90, effort: 6 })
        .toFile(desktopAvifPath);

      // 2. Tablet (Max width 1080)
      const tabletWebpPath = path.join(PUBLIC_MEDIAS_DIR, `${filenameNoExt}_tablet.webp`);
      const tabletAvifPath = path.join(PUBLIC_MEDIAS_DIR, `${filenameNoExt}_tablet.avif`);

      await sharp(filePath)
        .resize({ width: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90, effort: 6 })
        .toFile(tabletWebpPath);

      await sharp(filePath)
        .resize({ width: 1080, fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 88, effort: 6 })
        .toFile(tabletAvifPath);

      // 3. Mobile (Max width 640)
      const mobileWebpPath = path.join(PUBLIC_MEDIAS_DIR, `${filenameNoExt}_mobile.webp`);
      const mobileAvifPath = path.join(PUBLIC_MEDIAS_DIR, `${filenameNoExt}_mobile.avif`);

      await sharp(filePath)
        .resize({ width: 640, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90, effort: 6 })
        .toFile(mobileWebpPath);

      await sharp(filePath)
        .resize({ width: 640, fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 88, effort: 6 })
        .toFile(mobileAvifPath);

      console.log(`✓ Processed ${file} into 6 variants (WebP & AVIF) in public/medias/`);
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err);
    }
  }

  console.log('Image processing complete.');
}

processImages();
