const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes to generate
const sizes = {
  'icon-192.png': { width: 192, height: 192, padding: false },
  'icon-512.png': { width: 512, height: 512, padding: false },
  'icon-maskable-192.png': { width: 192, height: 192, padding: true },
  'icon-maskable-512.png': { width: 512, height: 512, padding: true },
  'apple-touch-icon.png': { width: 180, height: 180, padding: false },
};

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon-source.svg');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if source SVG exists
  if (!fs.existsSync(svgPath)) {
    console.error('❌ Error: icon-source.svg not found in public directory');
    process.exit(1);
  }

  // Read the SVG file
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate each icon size
  for (const [filename, config] of Object.entries(sizes)) {
    try {
      const outputPath = path.join(publicDir, filename);

      // We want all icons to have the light mode background color
      const backgroundColor = { r: 253, g: 251, b: 247, alpha: 1 }; // #FDFBF7

      let image;
      
      if (config.padding) {
        // For maskable icons, add 20% padding
        const innerSize = Math.floor(config.width * 0.8);
        const padding = Math.floor((config.width - innerSize) / 2);

        // Resize to inner size first
        const resizedBuffer = await sharp(svgBuffer)
          .resize(innerSize, innerSize)
          .png()
          .toBuffer();

        // Then add padding with background color
        image = sharp({
          create: {
            width: config.width,
            height: config.height,
            channels: 4,
            background: backgroundColor
          }
        })
        .composite([{
          input: resizedBuffer,
          top: padding,
          left: padding
        }]);
      } else if (filename === 'apple-touch-icon.png' || filename.startsWith('icon-')) {
        // For Apple and Android standard icons, ensure we have the background fill
        // to match the app theme, as transparency is often filled with black/white
        const resizedBuffer = await sharp(svgBuffer)
          .resize(config.width, config.height)
          .png()
          .toBuffer();

        image = sharp({
          create: {
            width: config.width,
            height: config.height,
            channels: 4,
            background: backgroundColor
          }
        })
        .composite([{
          input: resizedBuffer,
          top: 0,
          left: 0
        }]);
      } else {
        // Just resize for favicons etc
        image = sharp(svgBuffer).resize(config.width, config.height);
      }

      await image.png().toFile(outputPath);

      console.log(`✅ Generated: ${filename} (${config.width}x${config.height})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${filename}:`, error.message);
    }
  }

  // Generate multi-resolution favicon.ico
  console.log('\n🎨 Generating favicon.ico...');
  try {
    // Generate 32x32 and 16x16 PNGs
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();

    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toBuffer();

    // Save as individual files first (ICO creation is complex, so we'll use PNG for now)
    // Modern browsers support PNG favicons
    const faviconPath = path.join(publicDir, 'favicon.ico');

    // For simplicity, just use the 32x32 version as favicon.ico
    // (Browsers will handle it fine even as a PNG)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(faviconPath);

    console.log('✅ Generated: favicon.ico (32x32 PNG format)');

    // Also create a proper favicon.png for better browser support
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));

    console.log('✅ Generated: favicon.png (32x32)');
  } catch (error) {
    console.error('❌ Failed to generate favicon:', error.message);
  }

  console.log('\n✨ Icon generation complete!\n');
  console.log('📋 Generated files:');
  console.log('   - icon-192.png (Android minimum)');
  console.log('   - icon-512.png (Android splash)');
  console.log('   - icon-maskable-192.png (Android adaptive)');
  console.log('   - icon-maskable-512.png (Android adaptive large)');
  console.log('   - apple-touch-icon.png (iOS home screen)');
  console.log('   - favicon.ico (browser tab)');
  console.log('   - favicon.png (browser tab fallback)');
  console.log('\n🎯 You can now test your PWA with: npm run build && npm start\n');
}

generateIcons().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
