#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Performance Audit Starting...\n');

// Check bundle sizes
function checkBundleSize() {
  console.log('📦 Bundle Size Analysis:');
  
  const distPath = 'client/dist/public/assets';
  if (!existsSync(distPath)) {
    console.log('❌ Build not found. Run npm run build:deploy first.');
    return;
  }
  
  try {
    const files = execSync(`dir "${distPath}" /B`, { encoding: 'utf8' });
    const fileList = files.split('\n').filter(f => f.trim());
    
    console.log(`Found ${fileList.length} asset files`);
    
    let hasLargeBundles = false;
    let totalSize = 0;
    
    fileList.forEach(filename => {
      if (filename.includes('.js')) {
        try {
          const stats = execSync(`powershell "(Get-Item '${distPath}/${filename.trim()}').Length"`, { encoding: 'utf8' });
          const sizeBytes = parseInt(stats.trim());
          const sizeKB = sizeBytes / 1024;
          totalSize += sizeKB;
          
          console.log(`📄 ${filename.trim()}: ${sizeKB.toFixed(2)}KB`);
          
          if (sizeKB > 500) {
            console.log(`⚠️  Large bundle detected: ${sizeKB.toFixed(2)}KB`);
            hasLargeBundles = true;
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    });
    
    console.log(`📊 Total JS bundle size: ${totalSize.toFixed(2)}KB`);
    
    if (!hasLargeBundles) {
      console.log('✅ All bundles are optimally sized');
    }
  } catch (error) {
    console.log('❌ Error checking bundle sizes:', error.message);
  }
}

// Check image optimization
function checkImageOptimization() {
  console.log('\n🖼️  Image Optimization Check:');
  
  const imagesPath = 'client/public/images';
  const optimizedPath = 'client/public/images/optimized';
  
  if (!existsSync(imagesPath)) {
    console.log('❌ Images directory not found');
    return;
  }
  
  if (!existsSync(optimizedPath)) {
    console.log('⚠️  Optimized images not found. Run npm run optimize-images');
    return;
  }
  
  console.log('✅ Image optimization directory exists');
}

// Check preload directives
function checkPreloadDirectives() {
  console.log('\n⚡ Preload Directives Check:');
  
  const indexPath = 'client/index.html';
  if (!existsSync(indexPath)) {
    console.log('❌ index.html not found');
    return;
  }
  
  const content = readFileSync(indexPath, 'utf8');
  const preloadCount = (content.match(/rel="preload"/g) || []).length;
  
  console.log(`✅ Found ${preloadCount} preload directives`);
  
  if (content.includes('hero.jpg') || content.includes('hero.webp')) {
    console.log('✅ Hero image preload configured');
  } else {
    console.log('⚠️  Hero image preload not found');
  }
}

// Performance recommendations
function performanceRecommendations() {
  console.log('\n💡 Performance Recommendations:');
  console.log('1. ✅ Use WebP/AVIF formats for images');
  console.log('2. ✅ Implement lazy loading for below-fold content');
  console.log('3. ✅ Split JavaScript bundles by functionality');
  console.log('4. ✅ Preload critical assets');
  console.log('5. 🔄 Enable Brotli compression in Cloudflare');
  console.log('6. 🔄 Set aggressive caching headers for static assets');
  console.log('7. 🔄 Consider using a CDN for image delivery');
}

// Run all checks
checkBundleSize();
checkImageOptimization();
checkPreloadDirectives();
performanceRecommendations();

console.log('\n🎯 Performance audit complete!');