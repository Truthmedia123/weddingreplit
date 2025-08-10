#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if all required files are present and accessible
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const buildDir = 'client/dist/public';

console.log('🔍 Verifying deployment build...\n');

// Check if build directory exists
if (!existsSync(buildDir)) {
  console.error('❌ Build directory not found:', buildDir);
  process.exit(1);
}

// Required files to check
const requiredFiles = [
  'index.html',
  'data/categories.json',
  'data/featured-vendors.json',
  'data/blog-posts.json',
  '_headers'
];

let allFilesPresent = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = join(buildDir, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`);
    
    // Validate JSON files
    if (file.endsWith('.json')) {
      try {
        const content = readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        if (file === 'data/categories.json') {
          console.log(`   📊 Categories: ${data.categories?.length || 0}`);
        } else if (file === 'data/featured-vendors.json') {
          console.log(`   👥 Featured vendors: ${data.vendors?.length || 0}`);
        } else if (file === 'data/blog-posts.json') {
          console.log(`   📝 Blog posts: ${data.posts?.length || 0}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Invalid JSON: ${error.message}`);
      }
    }
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesPresent = false;
  }
});

// Check assets directory
const assetsDir = join(buildDir, 'assets');
if (existsSync(assetsDir)) {
  console.log('\n📦 Assets directory:');
  console.log('✅ assets/ directory exists');
} else {
  console.log('\n❌ assets/ directory missing');
  allFilesPresent = false;
}

// Check images directory
const imagesDir = join(buildDir, 'images');
if (existsSync(imagesDir)) {
  console.log('\n🖼️  Images directory:');
  console.log('✅ images/ directory exists');
} else {
  console.log('\n❌ images/ directory missing');
  allFilesPresent = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allFilesPresent) {
  console.log('✅ Deployment verification PASSED');
  console.log('🚀 Ready for deployment to Cloudflare Pages');
} else {
  console.log('❌ Deployment verification FAILED');
  console.log('🔧 Please fix missing files before deploying');
  process.exit(1);
}

console.log('\n💡 Deployment Tips:');
console.log('1. Ensure JSON files are served with correct MIME type');
console.log('2. Check _headers file is deployed for proper caching');
console.log('3. Verify fallback data is working in dataService.ts');
console.log('4. Test data loading in browser console');

console.log('\n🔗 Test URLs after deployment:');
console.log('- https://your-site.pages.dev/data/categories.json');
console.log('- https://your-site.pages.dev/data/featured-vendors.json');
console.log('- https://your-site.pages.dev/data/blog-posts.json');