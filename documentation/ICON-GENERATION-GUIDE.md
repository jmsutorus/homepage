# PWA Icon Generation Guide

## Source File
Use `public/icon-source.svg` as the base for all icon generation.

## Required Icons

### Method 1: Using RealFaviconGenerator (Recommended)
1. Go to https://realfavicongenerator.net
2. Upload `public/icon-source.svg`
3. Configure settings:
   - iOS: Select "Add a solid, plain background to fill the transparent regions"
   - Android: Select "Use a distinct silhouette" for maskable icons
4. Generate and download the package
5. Extract and place files in `public/` directory

### Method 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first if not installed
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Navigate to public directory
cd public

# Generate standard icons
magick icon-source.svg -resize 192x192 icon-192.png
magick icon-source.svg -resize 512x512 icon-512.png

# Generate maskable icons (with padding for safe zone)
magick icon-source.svg -resize 384x384 -gravity center -extent 512x512 -background "#E67E22" icon-maskable-512.png
magick icon-source.svg -resize 153x153 -gravity center -extent 192x192 -background "#E67E22" icon-maskable-192.png

# Generate Apple touch icon
magick icon-source.svg -resize 180x180 apple-touch-icon.png

# Generate favicon (multi-resolution ICO file)
magick icon-source.svg -resize 32x32 favicon-32.png
magick icon-source.svg -resize 16x16 favicon-16.png
magick favicon-32.png favicon-16.png favicon.ico
rm favicon-32.png favicon-16.png
```

### Method 3: Using Online Converters
1. **Favicon.io**: https://favicon.io/favicon-converter/
   - Upload SVG
   - Download favicon package

2. **CloudConvert**: https://cloudconvert.com/svg-to-png
   - Convert SVG to different PNG sizes
   - Set width/height for each required size

## Quick Start (Temporary Placeholders)
For development/testing purposes, you can use the provided SVG for now and generate PNGs later:

```bash
# Copy SVG as temporary placeholder (won't work for all icons but allows testing)
cp icon-source.svg icon-192.png
cp icon-source.svg icon-512.png
```

## Icon Sizes Reference
- `icon-192.png`: 192x192px (Android minimum)
- `icon-512.png`: 512x512px (Android splash)
- `icon-maskable-192.png`: 192x192px with 20% safe zone padding
- `icon-maskable-512.png`: 512x512px with 20% safe zone padding
- `apple-touch-icon.png`: 180x180px (iOS home screen)
- `favicon.ico`: Multi-resolution (16x16, 32x32)

## Maskable Icons
Maskable icons need a 20% safe zone padding to ensure the icon isn't clipped on Android adaptive icons. The important content (the "H" letter) should stay within the center 60% of the canvas.

## Verification
After generating, verify icons at:
- https://maskable.app (for maskable icons)
- Chrome DevTools > Application > Manifest (for all icons)
