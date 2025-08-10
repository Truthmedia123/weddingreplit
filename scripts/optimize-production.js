#!/usr/bin/env node

// Production optimization script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionOptimizer {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.publicPath = path.join(this.distPath, 'public');
  }

  async optimize() {
    console.log('🚀 Starting production optimization...\n');

    await this.cleanBuildDirectory();
    await this.buildProduction();
    await this.optimizeAssets();
    await this.generateManifest();
    await this.analyzeBundle();
    
    console.log('\n✅ Production optimization complete!');
  }

  async cleanBuildDirectory() {
    console.log('🧹 Cleaning build directory...');
    try {
      if (fs.existsSync(this.distPath)) {
        execSync(`rmdir /s /q "${this.distPath}"`, { stdio: 'pipe' });
      }
      console.log('✅ Build directory cleaned');
    } catch (error) {
      console.log('ℹ️  Build directory already clean');
    }
  }

  async buildProduction() {
    console.log('🔨 Building production assets...');
    try {
      execSync('npm run build:production', { stdio: 'inherit' });
      console.log('✅ Production build complete');
    } catch (error) {
      console.error('❌ Production build failed:', error.message);
      process.exit(1);
    }
  }

  async optimizeAssets() {
    console.log('⚡ Optimizing assets...');
    
    if (!fs.existsSync(this.publicPath)) {
      console.log('⚠️  Public directory not found, skipping asset optimization');
      return;
    }

    // Get asset statistics
    const assets = this.getAssetStats();
    
    console.log('📊 Asset Statistics:');
    console.log(`  JavaScript files: ${assets.js.count} (${this.formatBytes(assets.js.size)})`);
    console.log(`  CSS files: ${assets.css.count} (${this.formatBytes(assets.css.size)})`);
    console.log(`  Image files: ${assets.images.count} (${this.formatBytes(assets.images.size)})`);
    console.log(`  Other files: ${assets.other.count} (${this.formatBytes(assets.other.size)})`);
    console.log(`  Total size: ${this.formatBytes(assets.total)}`);

    // Check for large assets
    const largeAssets = this.findLargeAssets();
    if (largeAssets.length > 0) {
      console.log('\n⚠️  Large assets detected:');
      largeAssets.forEach(asset => {
        console.log(`  - ${asset.name}: ${this.formatBytes(asset.size)}`);
      });
    }

    console.log('✅ Asset optimization analysis complete');
  }

  getAssetStats() {
    const stats = {
      js: { count: 0, size: 0 },
      css: { count: 0, size: 0 },
      images: { count: 0, size: 0 },
      other: { count: 0, size: 0 },
      total: 0
    };

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          const size = stat.size;
          stats.total += size;
          
          if (['.js', '.mjs'].includes(ext)) {
            stats.js.count++;
            stats.js.size += size;
          } else if (ext === '.css') {
            stats.css.count++;
            stats.css.size += size;
          } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
            stats.images.count++;
            stats.images.size += size;
          } else {
            stats.other.count++;
            stats.other.size += size;
          }
        }
      });
    };

    walkDir(this.publicPath);
    return stats;
  }

  findLargeAssets(threshold = 500 * 1024) { // 500KB threshold
    const largeAssets = [];
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (stat.size > threshold) {
          largeAssets.push({
            name: path.relative(this.publicPath, filePath),
            size: stat.size
          });
        }
      });
    };

    if (fs.existsSync(this.publicPath)) {
      walkDir(this.publicPath);
    }
    
    return largeAssets.sort((a, b) => b.size - a.size);
  }

  async generateManifest() {
    console.log('📋 Generating asset manifest...');
    
    const manifest = {
      buildTime: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: 'production',
      assets: {}
    };

    if (fs.existsSync(this.publicPath)) {
      const walkDir = (dir, basePath = '') => {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const relativePath = path.join(basePath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            walkDir(filePath, relativePath);
          } else {
            manifest.assets[relativePath] = {
              size: stat.size,
              modified: stat.mtime.toISOString()
            };
          }
        });
      };

      walkDir(this.publicPath);
    }

    const manifestPath = path.join(this.distPath, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Asset manifest generated: ${manifestPath}`);
  }

  async analyzeBundle() {
    console.log('📈 Analyzing bundle composition...');
    
    // This would integrate with bundle analyzer tools
    // For now, we'll provide basic analysis
    const stats = this.getAssetStats();
    const total = stats.total;
    
    console.log('\n📊 Bundle Composition:');
    console.log(`  JavaScript: ${((stats.js.size / total) * 100).toFixed(1)}%`);
    console.log(`  CSS: ${((stats.css.size / total) * 100).toFixed(1)}%`);
    console.log(`  Images: ${((stats.images.size / total) * 100).toFixed(1)}%`);
    console.log(`  Other: ${((stats.other.size / total) * 100).toFixed(1)}%`);
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    
    if (stats.js.size > 1024 * 1024) { // > 1MB
      console.log('  - Consider code splitting for JavaScript bundles');
    }
    
    if (stats.images.size > 2 * 1024 * 1024) { // > 2MB
      console.log('  - Consider image optimization and WebP format');
    }
    
    if (stats.total > 5 * 1024 * 1024) { // > 5MB
      console.log('  - Total bundle size is large, consider lazy loading');
    } else {
      console.log('  - Bundle size is optimized for production');
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new ProductionOptimizer();
  optimizer.optimize().catch(error => {
    console.error('❌ Production optimization failed:', error);
    process.exit(1);
  });
}

module.exports = { ProductionOptimizer };