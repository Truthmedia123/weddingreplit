#!/usr/bin/env node

/**
 * 📊 Bundle Analysis Script
 * 
 * This script analyzes the bundle size and provides optimization recommendations.
 * Run with: node scripts/analyze-bundle.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  const distPath = path.resolve(__dirname, '../dist/public');
  
  if (!fs.existsSync(distPath)) {
    log('❌ Dist folder not found. Please run "npm run build" first.', 'red');
    process.exit(1);
  }

  log('🔍 Analyzing bundle...', 'cyan');
  
  const jsFiles = [];
  const cssFiles = [];
  const assetFiles = [];
  
  function scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativeItemPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, relativeItemPath);
      } else {
        const size = stat.size;
        const fileInfo = {
          name: item,
          path: relativeItemPath,
          size: size,
          formattedSize: formatBytes(size)
        };
        
        if (item.endsWith('.js')) {
          jsFiles.push(fileInfo);
        } else if (item.endsWith('.css')) {
          cssFiles.push(fileInfo);
        } else {
          assetFiles.push(fileInfo);
        }
      }
    }
  }
  
  scanDirectory(distPath);
  
  // Sort files by size (largest first)
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);
  assetFiles.sort((a, b) => b.size - a.size);
  
  // Calculate totals
  const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
  const totalAssetSize = assetFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSize = totalJsSize + totalCssSize + totalAssetSize;
  
  // Print analysis results
  log('\n📊 BUNDLE ANALYSIS RESULTS', 'bright');
  log('=' .repeat(50), 'blue');
  
  log(`\n📦 Total Bundle Size: ${formatBytes(totalSize)}`, 'bright');
  log(`   ├─ JavaScript: ${formatBytes(totalJsSize)} (${((totalJsSize / totalSize) * 100).toFixed(1)}%)`, 'yellow');
  log(`   ├─ CSS: ${formatBytes(totalCssSize)} (${((totalCssSize / totalSize) * 100).toFixed(1)}%)`, 'green');
  log(`   └─ Assets: ${formatBytes(totalAssetSize)} (${((totalAssetSize / totalSize) * 100).toFixed(1)}%)`, 'magenta');
  
  // JavaScript files analysis
  log('\n🔧 JAVASCRIPT FILES:', 'bright');
  log('─'.repeat(50), 'blue');
  
  jsFiles.forEach((file, index) => {
    const percentage = ((file.size / totalJsSize) * 100).toFixed(1);
    const prefix = index === 0 ? '📄' : '  ';
    log(`${prefix} ${file.name}: ${file.formattedSize} (${percentage}%)`, 'yellow');
  });
  
  // CSS files analysis
  log('\n🎨 CSS FILES:', 'bright');
  log('─'.repeat(50), 'blue');
  
  cssFiles.forEach((file, index) => {
    const percentage = ((file.size / totalCssSize) * 100).toFixed(1);
    const prefix = index === 0 ? '📄' : '  ';
    log(`${prefix} ${file.name}: ${file.formattedSize} (${percentage}%)`, 'green');
  });
  
  // Large assets analysis
  const largeAssets = assetFiles.filter(file => file.size > 100 * 1024); // > 100KB
  if (largeAssets.length > 0) {
    log('\n🖼️  LARGE ASSETS (>100KB):', 'bright');
    log('─'.repeat(50), 'blue');
    
    largeAssets.forEach((file, index) => {
      const percentage = ((file.size / totalAssetSize) * 100).toFixed(1);
      const prefix = index === 0 ? '📄' : '  ';
      log(`${prefix} ${file.name}: ${file.formattedSize} (${percentage}%)`, 'magenta');
    });
  }
  
  // Performance analysis
  log('\n⚡ PERFORMANCE ANALYSIS:', 'bright');
  log('─'.repeat(50), 'blue');
  
  const largestJsFile = jsFiles[0];
  const largestCssFile = cssFiles[0];
  
  if (largestJsFile && largestJsFile.size > 500 * 1024) { // > 500KB
    log(`⚠️  Large JavaScript file detected: ${largestJsFile.name} (${largestJsFile.formattedSize})`, 'red');
    log('   Consider code splitting or lazy loading for this chunk.', 'yellow');
  }
  
  if (largestCssFile && largestCssFile.size > 100 * 1024) { // > 100KB
    log(`⚠️  Large CSS file detected: ${largestCssFile.name} (${largestCssFile.formattedSize})`, 'red');
    log('   Consider CSS code splitting or purging unused styles.', 'yellow');
  }
  
  // Bundle optimization recommendations
  log('\n💡 OPTIMIZATION RECOMMENDATIONS:', 'bright');
  log('─'.repeat(50), 'blue');
  
  const recommendations = [];
  
  if (totalSize > 2 * 1024 * 1024) { // > 2MB
    recommendations.push('📦 Bundle size is large (>2MB). Consider aggressive code splitting.');
  }
  
  if (jsFiles.length > 10) {
    recommendations.push('🔧 Many JavaScript chunks detected. Consider consolidating related chunks.');
  }
  
  if (cssFiles.length > 5) {
    recommendations.push('🎨 Multiple CSS files. Consider CSS optimization and purging.');
  }
  
  if (largeAssets.length > 0) {
    recommendations.push('🖼️  Large assets detected. Consider image optimization and lazy loading.');
  }
  
  if (recommendations.length === 0) {
    log('✅ Bundle looks well optimized!', 'green');
  } else {
    recommendations.forEach((rec, index) => {
      log(`${index + 1}. ${rec}`, 'yellow');
    });
  }
  
  // Performance score
  let score = 100;
  if (totalSize > 2 * 1024 * 1024) score -= 20;
  if (largestJsFile && largestJsFile.size > 500 * 1024) score -= 15;
  if (jsFiles.length > 10) score -= 10;
  if (largeAssets.length > 3) score -= 10;
  
  score = Math.max(0, score);
  
  log('\n🏆 PERFORMANCE SCORE:', 'bright');
  log('─'.repeat(50), 'blue');
  
  if (score >= 90) {
    log(`🎉 Excellent! Score: ${score}/100`, 'green');
  } else if (score >= 70) {
    log(`👍 Good! Score: ${score}/100`, 'yellow');
  } else {
    log(`⚠️  Needs improvement! Score: ${score}/100`, 'red');
  }
  
  // Generate report file
  const report = {
    timestamp: new Date().toISOString(),
    totalSize,
    totalJsSize,
    totalCssSize,
    totalAssetSize,
    jsFiles: jsFiles.map(f => ({ name: f.name, size: f.size, formattedSize: f.formattedSize })),
    cssFiles: cssFiles.map(f => ({ name: f.name, size: f.size, formattedSize: f.formattedSize })),
    largeAssets: largeAssets.map(f => ({ name: f.name, size: f.size, formattedSize: f.formattedSize })),
    performanceScore: score,
    recommendations
  };
  
  const reportPath = path.resolve(__dirname, '../bundle-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📄 Detailed report saved to: bundle-analysis-report.json`, 'cyan');
  
  return {
    totalSize,
    performanceScore: score,
    recommendations
  };
}

// Run analysis if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    analyzeBundle();
  } catch (error) {
    log(`❌ Analysis failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

export { analyzeBundle };
