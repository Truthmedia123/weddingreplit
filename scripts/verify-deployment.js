#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Deployment Verification Starting...\n');

const buildDir = 'client/dist/public';

// Check if build directory exists
if (!existsSync(buildDir)) {
  console.log('❌ Build directory not found. Run npm run build:deploy first.');
  process.exit(1);
}

// Check critical files
const criticalFiles = [
  'index.html',
  'data/categories.json',
  'data/featured-vendors.json', 
  'data/blog-posts.json',
  'images/hero.jpg',
  'category-icons.json'
];

console.log('📁 Critical Files Check:');
let allFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = join(buildDir, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check data file contents
console.log('\n📊 Data Files Validation:');

try {
  const categoriesData = JSON.parse(readFileSync(join(buildDir, 'data/categories.json'), 'utf8'));
  console.log(`✅ Categories: ${categoriesData.categories?.length || 0} items`);
} catch (error) {
  console.log('❌ Categories data invalid or missing');
  allFilesExist = false;
}

try {
  const vendorsData = JSON.parse(readFileSync(join(buildDir, 'data/featured-vendors.json'), 'utf8'));
  console.log(`✅ Featured Vendors: ${vendorsData.vendors?.length || 0} items`);
} catch (error) {
  console.log('❌ Featured vendors data invalid or missing');
  allFilesExist = false;
}

try {
  const blogData = JSON.parse(readFileSync(join(buildDir, 'data/blog-posts.json'), 'utf8'));
  console.log(`✅ Blog Posts: ${blogData.posts?.length || 0} items`);
} catch (error) {
  console.log('❌ Blog posts data invalid or missing');
  allFilesExist = false;
}

// Check image paths in index.html
console.log('\n🖼️  Image Path Verification:');
try {
  const indexHtml = readFileSync(join(buildDir, 'index.html'), 'utf8');
  
  if (indexHtml.includes('href="/images/hero.jpg"')) {
    console.log('✅ Hero image preload found');
  } else {
    console.log('⚠️  Hero image preload not found in HTML');
  }
  
  if (indexHtml.includes('base href="/"') || !indexHtml.includes('base href=')) {
    console.log('✅ Base path correctly configured');
  } else {
    console.log('❌ Base path misconfigured');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Could not verify index.html');
  allFilesExist = false;
}

// Final result
console.log('\n🎯 Deployment Verification Result:');
if (allFilesExist) {
  console.log('✅ All checks passed! Deployment is ready.');
  console.log('\n📋 Deployment Checklist:');
  console.log('- ✅ Static data files included');
  console.log('- ✅ Images properly referenced');
  console.log('- ✅ Base path configured');
  console.log('- ✅ Critical assets present');
  console.log('\n🚀 Ready to deploy!');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}