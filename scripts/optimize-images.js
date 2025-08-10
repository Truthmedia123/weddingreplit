#!/usr/bin/env node

import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminAvif from 'imagemin-avif';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputDir = join(__dirname, '../client/public/images');
const outputDir = join(__dirname, '../client/public/images/optimized');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
  console.log('🖼️  Optimizing images...');
  
  try {
    // Check if there are any images to optimize
    const { readdirSync } = await import('fs');
    const files = readdirSync(inputDir).filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );
    
    if (files.length === 0) {
      console.log('ℹ️  No images found to optimize. Skipping...');
      return;
    }
    
    console.log(`Found ${files.length} images to optimize`);
    
    // Generate WebP versions
    await imagemin([`${inputDir}/*.{jpg,jpeg,png}`], {
      destination: outputDir,
      plugins: [
        imageminWebp({
          quality: 85,
          method: 6
        })
      ]
    });
    
    // Skip AVIF for now due to compatibility issues
    console.log('⚠️  Skipping AVIF generation due to library compatibility');
    
    // Optimize original JPEGs
    await imagemin([`${inputDir}/*.{jpg,jpeg}`], {
      destination: outputDir,
      plugins: [
        imageminMozjpeg({
          quality: 85,
          progressive: true
        })
      ]
    });
    
    // Optimize original PNGs
    await imagemin([`${inputDir}/*.png`], {
      destination: outputDir,
      plugins: [
        imageminPngquant({
          quality: [0.8, 0.9]
        })
      ]
    });
    
    console.log('✅ Images optimized successfully!');
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    console.log('ℹ️  Continuing with build process...');
  }
}

optimizeImages();