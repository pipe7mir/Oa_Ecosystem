/**
 * PWA Icon Generator Script
 * Generates PWA icons from the official OASIS logo
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceLogo = path.join(__dirname, '../src/img/logos/LOGO1.png');
const publicDir = path.join(__dirname, '../public');

const icons = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.ico', size: 32 }
];

async function generateIcons() {
    console.log('🎨 Generating PWA icons from official OASIS logo...\n');
    
    // Check if source logo exists
    if (!fs.existsSync(sourceLogo)) {
        console.error('❌ Source logo not found:', sourceLogo);
        process.exit(1);
    }

    // Get logo metadata
    const metadata = await sharp(sourceLogo).metadata();
    console.log(`📁 Source: LOGO1.png (${metadata.width}x${metadata.height})`);
    console.log(`📂 Output: ${publicDir}\n`);

    for (const icon of icons) {
        const outputPath = path.join(publicDir, icon.name);
        
        try {
            await sharp(sourceLogo)
                .resize(icon.size, icon.size, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toFile(outputPath);
            
            console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size})`);
        } catch (err) {
            console.error(`❌ Failed to generate ${icon.name}:`, err.message);
        }
    }

    console.log('\n🎉 PWA icons generated successfully!');
    console.log('   The app will now use the official OASIS logo when installed on mobile devices.');
}

generateIcons().catch(console.error);
