#!/usr/bin/env node

/**
 * 🚀 Automated Performance Audit
 * 
 * This script runs comprehensive performance audits using Lighthouse
 * and custom metrics to ensure the application meets performance standards.
 */

import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  'first-contentful-paint': 1500, // 1.5s
  'largest-contentful-paint': 2500, // 2.5s
  'first-meaningful-paint': 1600, // 1.6s
  'speed-index': 3000, // 3.0s
  'interactive': 3000, // 3.0s
  'first-cpu-idle': 2000, // 2.0s
  'max-potential-fid': 100, // 100ms
  'cumulative-layout-shift': 0.1, // 0.1
  'total-blocking-time': 200, // 200ms
};

const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'interactive',
      'first-cpu-idle',
      'max-potential-fid',
      'cumulative-layout-shift',
      'total-blocking-time',
      'bootup-time',
      'mainthread-work-breakdown',
      'network-requests',
      'resource-summary',
      'third-party-summary',
      'unused-css-rules',
      'unused-javascript',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-responsive-images',
      'efficient-animated-content',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
    ],
  },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Run Lighthouse audit
 */
async function runLighthouseAudit(url, options = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const lighthouseOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      ...options,
    };

    const runnerResult = await lighthouse(url, lighthouseOptions, LIGHTHOUSE_CONFIG);
    
    return runnerResult;
  } finally {
    await chrome.kill();
  }
}

/**
 * Analyze Lighthouse results
 */
function analyzeLighthouseResults(results) {
  const { lhr } = results;
  const { audits, categories } = lhr;
  
  const performanceScore = categories.performance.score * 100;
  const coreWebVitals = {
    fcp: audits['first-contentful-paint'],
    lcp: audits['largest-contentful-paint'],
    cls: audits['cumulative-layout-shift'],
    fid: audits['max-potential-fid'],
    tbt: audits['total-blocking-time'],
  };
  
  const opportunities = categories.performance.auditRefs
    .filter(ref => audits[ref.id] && audits[ref.id].details && audits[ref.id].details.overallSavingsMs > 0)
    .map(ref => ({
      id: ref.id,
      title: audits[ref.id].title,
      description: audits[ref.id].description,
      savings: audits[ref.id].details.overallSavingsMs,
      score: audits[ref.id].score,
    }))
    .sort((a, b) => b.savings - a.savings);
  
  return {
    performanceScore,
    coreWebVitals,
    opportunities,
    audits,
  };
}

/**
 * Check if metrics meet thresholds
 */
function checkThresholds(coreWebVitals) {
  const results = {};
  
  for (const [metric, audit] of Object.entries(coreWebVitals)) {
    const value = audit.numericValue;
    const threshold = PERFORMANCE_THRESHOLDS[audit.id];
    
    if (threshold) {
      const passed = value <= threshold;
      results[metric] = {
        value,
        threshold,
        passed,
        audit: audit.title,
        unit: audit.numericUnit,
      };
    }
  }
  
  return results;
}

/**
 * Generate performance report
 */
function generateReport(analysis, thresholdResults, url) {
  const { performanceScore, coreWebVitals, opportunities } = analysis;
  
  const report = {
    timestamp: new Date().toISOString(),
    url,
    performanceScore,
    passed: performanceScore >= 90,
    coreWebVitals: Object.entries(coreWebVitals).map(([key, audit]) => ({
      metric: key,
      title: audit.title,
      value: audit.numericValue,
      displayValue: audit.displayValue,
      score: audit.score,
    })),
    thresholds: thresholdResults,
    opportunities: opportunities.slice(0, 10), // Top 10 opportunities
    summary: {
      totalOpportunities: opportunities.length,
      totalSavings: opportunities.reduce((sum, opp) => sum + opp.savings, 0),
      criticalIssues: Object.values(thresholdResults).filter(r => !r.passed).length,
    },
  };
  
  return report;
}

/**
 * Display results in console
 */
function displayResults(report) {
  log('\n🚀 PERFORMANCE AUDIT RESULTS', 'bright');
  log('=' .repeat(50), 'blue');
  
  // Overall score
  const scoreColor = report.performanceScore >= 90 ? 'green' : 
                    report.performanceScore >= 70 ? 'yellow' : 'red';
  log(`\n📊 Performance Score: ${report.performanceScore.toFixed(1)}/100`, scoreColor);
  
  if (report.passed) {
    log('✅ Performance audit PASSED', 'green');
  } else {
    log('❌ Performance audit FAILED', 'red');
  }
  
  // Core Web Vitals
  log('\n⚡ Core Web Vitals:', 'bright');
  log('─' .repeat(50), 'blue');
  
  report.coreWebVitals.forEach(({ metric, title, displayValue, score }) => {
    const scoreColor = score >= 0.9 ? 'green' : score >= 0.5 ? 'yellow' : 'red';
    const icon = score >= 0.9 ? '✅' : score >= 0.5 ? '⚠️ ' : '❌';
    log(`${icon} ${title}: ${displayValue}`, scoreColor);
  });
  
  // Threshold checks
  log('\n🎯 Threshold Checks:', 'bright');
  log('─' .repeat(50), 'blue');
  
  Object.entries(report.thresholds).forEach(([metric, result]) => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.audit}: ${result.value.toFixed(0)}${result.unit} (limit: ${result.threshold}${result.unit})`, color);
  });
  
  // Top opportunities
  if (report.opportunities.length > 0) {
    log('\n💡 Top Performance Opportunities:', 'bright');
    log('─' .repeat(50), 'blue');
    
    report.opportunities.slice(0, 5).forEach((opp, index) => {
      const savings = (opp.savings / 1000).toFixed(1);
      log(`${index + 1}. ${opp.title} (Save ~${savings}s)`, 'yellow');
    });
  }
  
  // Summary
  log('\n📈 Summary:', 'bright');
  log('─' .repeat(50), 'blue');
  log(`   Critical Issues: ${report.summary.criticalIssues}`, report.summary.criticalIssues > 0 ? 'red' : 'green');
  log(`   Total Opportunities: ${report.summary.totalOpportunities}`, 'cyan');
  log(`   Potential Savings: ${(report.summary.totalSavings / 1000).toFixed(1)}s`, 'cyan');
}

/**
 * Save report to file
 */
async function saveReport(report) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `performance-audit-${timestamp}.json`;
  const filepath = path.join(__dirname, '..', 'reports', filename);
  
  // Ensure reports directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  
  await fs.writeFile(filepath, JSON.stringify(report, null, 2));
  log(`\n📄 Report saved to: ${filename}`, 'cyan');
  
  return filepath;
}

/**
 * Main audit function
 */
async function runPerformanceAudit(url = 'http://localhost:3000') {
  try {
    log('🔍 Starting performance audit...', 'cyan');
    log(`📍 Target URL: ${url}`, 'blue');
    
    // Run Lighthouse audit
    log('\n⚡ Running Lighthouse audit...', 'cyan');
    const results = await runLighthouseAudit(url);
    
    // Analyze results
    const analysis = analyzeLighthouseResults(results);
    const thresholdResults = checkThresholds(analysis.coreWebVitals);
    
    // Generate report
    const report = generateReport(analysis, thresholdResults, url);
    
    // Display results
    displayResults(report);
    
    // Save report
    await saveReport(report);
    
    // Exit with appropriate code
    const exitCode = report.passed && report.summary.criticalIssues === 0 ? 0 : 1;
    
    if (exitCode === 0) {
      log('\n🎉 Performance audit completed successfully!', 'green');
    } else {
      log('\n⚠️  Performance audit completed with issues. Please review the opportunities above.', 'yellow');
    }
    
    return { report, exitCode };
    
  } catch (error) {
    log(`\n❌ Performance audit failed: ${error.message}`, 'red');
    console.error(error);
    return { report: null, exitCode: 1 };
  }
}

// Run audit if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2] || 'http://localhost:3000';
  
  runPerformanceAudit(url).then(({ exitCode }) => {
    process.exit(exitCode);
  }).catch((error) => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
}

export { runPerformanceAudit };
export default runPerformanceAudit;