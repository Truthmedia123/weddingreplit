#!/usr/bin/env node

/**
 * 📦 Bundle Analysis Script
 * 
 * Analyzes bundle sizes and provides optimization recommendations
 * for achieving <2s load times and optimal Core Web Vitals.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle size thresholds
const THRESHOLDS = {
  initial: 500, // KB
  vendor: 200,   // KB
  ui: 100,       // KB
  icons: 50,     // KB
  total: 800     // KB
};

// Performance budgets
const PERFORMANCE_BUDGETS = {
  fcp: 1800,     // ms
  lcp: 2500,     // ms
  fid: 100,      // ms
  cls: 0.1,      // score
  ttfb: 600      // ms
};

class BundleAnalyzer {
  constructor() {
    this.distPath = path.join(__dirname, '../dist');
    this.analysisPath = path.join(this.distPath, 'bundle-analysis.html');
    this.results = {
      chunks: [],
      totalSize: 0,
      recommendations: [],
      warnings: [],
      errors: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing bundle sizes...\n');

    try {
      // Check if bundle analysis file exists
      if (!fs.existsSync(this.analysisPath)) {
        console.log('❌ Bundle analysis file not found. Run "npm run analyze" first.');
        return;
      }

      // Parse bundle analysis
      await this.parseBundleAnalysis();
      
      // Analyze chunks
      this.analyzeChunks();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Print results
      this.printResults();
      
      // Save detailed report
      this.saveReport();
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
    }
  }

  async parseBundleAnalysis() {
    const analysisContent = fs.readFileSync(this.analysisPath, 'utf8');
    
    // Extract chunk information from the HTML
    const chunkMatches = analysisContent.match(/<script[^>]*>window\.__CHUNKS__\s*=\s*(\[.*?\]);<\/script>/s);
    
    if (chunkMatches) {
      try {
        const chunksData = JSON.parse(chunkMatches[1]);
        this.results.chunks = chunksData.map(chunk => ({
          name: chunk.name,
          size: chunk.size,
          gzipSize: chunk.gzipSize,
          brotliSize: chunk.brotliSize,
          modules: chunk.modules || []
        }));
      } catch (error) {
        console.warn('⚠️ Could not parse chunk data, using fallback analysis');
        this.fallbackAnalysis();
      }
    } else {
      this.fallbackAnalysis();
    }
  }

  fallbackAnalysis() {
    // Fallback: analyze dist directory
    const jsFiles = this.getJsFiles();
    
    this.results.chunks = jsFiles.map(file => {
      const stats = fs.statSync(file);
      const size = stats.size / 1024; // Convert to KB
      
      return {
        name: path.basename(file),
        size: size,
        gzipSize: size * 0.3, // Estimate gzip size
        brotliSize: size * 0.2, // Estimate brotli size
        modules: []
      };
    });
  }

  getJsFiles() {
    const jsFiles = [];
    
    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.js')) {
          jsFiles.push(filePath);
        }
      });
    };
    
    scanDirectory(this.distPath);
    return jsFiles;
  }

  analyzeChunks() {
    this.results.totalSize = this.results.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    
    this.results.chunks.forEach(chunk => {
      // Check individual chunk sizes
      if (chunk.size > THRESHOLDS.initial && chunk.name.includes('index')) {
        this.results.warnings.push(`Initial chunk is too large: ${chunk.name} (${chunk.size.toFixed(1)}KB)`);
      }
      
      if (chunk.size > THRESHOLDS.vendor && chunk.name.includes('vendor')) {
        this.results.warnings.push(`Vendor chunk is too large: ${chunk.name} (${chunk.size.toFixed(1)}KB)`);
      }
      
      if (chunk.size > THRESHOLDS.ui && chunk.name.includes('ui')) {
        this.results.warnings.push(`UI chunk is too large: ${chunk.name} (${chunk.size.toFixed(1)}KB)`);
      }
      
      if (chunk.size > THRESHOLDS.icons && chunk.name.includes('icons')) {
        this.results.warnings.push(`Icons chunk is too large: ${chunk.name} (${chunk.size.toFixed(1)}KB)`);
      }
    });
    
    // Check total size
    if (this.results.totalSize > THRESHOLDS.total) {
      this.results.errors.push(`Total bundle size exceeds threshold: ${this.results.totalSize.toFixed(1)}KB > ${THRESHOLDS.total}KB`);
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Bundle size recommendations
    if (this.results.totalSize > THRESHOLDS.total) {
      recommendations.push({
        type: 'critical',
        title: 'Reduce Bundle Size',
        description: 'Total bundle size is too large for optimal performance',
        actions: [
          'Implement code splitting for routes',
          'Use dynamic imports for heavy components',
          'Optimize third-party dependencies',
          'Remove unused code with tree shaking'
        ]
      });
    }
    
    // Check for large dependencies
    const largeChunks = this.results.chunks.filter(chunk => chunk.size > 100);
    if (largeChunks.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Optimize Large Chunks',
        description: `${largeChunks.length} chunks are larger than 100KB`,
        actions: [
          'Split large chunks into smaller modules',
          'Use lazy loading for non-critical features',
          'Consider using CDN for large libraries'
        ]
      });
    }
    
    // Check for duplicate dependencies
    const duplicateModules = this.findDuplicateModules();
    if (duplicateModules.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Remove Duplicate Dependencies',
        description: 'Found duplicate modules across chunks',
        actions: [
          'Check for duplicate package installations',
          'Use webpack bundle analyzer to identify duplicates',
          'Configure webpack to deduplicate modules'
        ]
      });
    }
    
    // Performance recommendations
    recommendations.push({
      type: 'info',
      title: 'Performance Optimizations',
      description: 'General performance improvements',
      actions: [
        'Enable gzip/brotli compression',
        'Use CDN for static assets',
        'Implement service worker for caching',
        'Optimize images with WebP/AVIF formats',
        'Use resource hints (preload, prefetch)'
      ]
    });
    
    this.results.recommendations = recommendations;
  }

  findDuplicateModules() {
    const moduleMap = new Map();
    const duplicates = [];
    
    this.results.chunks.forEach(chunk => {
      chunk.modules.forEach(module => {
        if (moduleMap.has(module.name)) {
          duplicates.push({
            name: module.name,
            chunks: [moduleMap.get(module.name), chunk.name]
          });
        } else {
          moduleMap.set(module.name, chunk.name);
        }
      });
    });
    
    return duplicates;
  }

  printResults() {
    console.log('📊 Bundle Analysis Results\n');
    
    // Summary
    console.log(`📦 Total Bundle Size: ${this.results.totalSize.toFixed(1)}KB`);
    console.log(`📦 Number of Chunks: ${this.results.chunks.length}`);
    console.log(`📦 Average Chunk Size: ${(this.results.totalSize / this.results.chunks.length).toFixed(1)}KB\n`);
    
    // Chunk breakdown
    console.log('📋 Chunk Breakdown:');
    this.results.chunks.forEach(chunk => {
      const status = chunk.size > 100 ? '⚠️' : '✅';
      console.log(`  ${status} ${chunk.name}: ${chunk.size.toFixed(1)}KB (gzip: ${chunk.gzipSize.toFixed(1)}KB)`);
    });
    console.log();
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
      console.log();
    }
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('❌ Errors:');
      this.results.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
      console.log();
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : '💡';
        console.log(`\n${icon} ${rec.title}`);
        console.log(`   ${rec.description}`);
        console.log('   Actions:');
        rec.actions.forEach(action => {
          console.log(`     • ${action}`);
        });
      });
      console.log();
    }
    
    // Performance score
    const score = this.calculatePerformanceScore();
    console.log(`🎯 Performance Score: ${score.toFixed(0)}/100`);
    
    if (score >= 90) {
      console.log('✅ Excellent performance! Bundle is well optimized.');
    } else if (score >= 70) {
      console.log('⚠️ Good performance, but there\'s room for improvement.');
    } else {
      console.log('❌ Performance needs improvement. Review recommendations above.');
    }
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Bundle size scoring (40% weight)
    const sizeRatio = this.results.totalSize / THRESHOLDS.total;
    if (sizeRatio > 1.5) score -= 40;
    else if (sizeRatio > 1.2) score -= 20;
    else if (sizeRatio > 1.0) score -= 10;
    
    // Chunk count scoring (20% weight)
    if (this.results.chunks.length > 10) score -= 20;
    else if (this.results.chunks.length > 5) score -= 10;
    
    // Large chunks scoring (20% weight)
    const largeChunks = this.results.chunks.filter(chunk => chunk.size > 100).length;
    if (largeChunks > 3) score -= 20;
    else if (largeChunks > 1) score -= 10;
    
    // Warnings scoring (20% weight)
    if (this.results.warnings.length > 5) score -= 20;
    else if (this.results.warnings.length > 2) score -= 10;
    
    return Math.max(0, score);
  }

  saveReport() {
    const reportPath = path.join(this.distPath, 'bundle-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      thresholds: THRESHOLDS,
      results: this.results,
      performanceScore: this.calculatePerformanceScore()
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyze().catch(console.error);
