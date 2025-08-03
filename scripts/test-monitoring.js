#!/usr/bin/env node

// Test monitoring and health check scripts
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestMonitor {
  constructor() {
    this.resultsDir = path.join(process.cwd(), 'test-results');
    this.metricsDir = path.join(process.cwd(), 'test-metrics');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.resultsDir, this.metricsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Run health checks for different environments
  async runHealthCheck(environment = 'local') {
    console.log(`🔍 Running health checks for ${environment} environment...`);
    
    const healthUrls = {
      local: 'http://localhost:3000',
      staging: process.env.STAGING_URL || 'https://staging.example.com',
      production: process.env.PROD_URL || 'https://production.example.com'
    };

    const baseUrl = healthUrls[environment];
    if (!baseUrl) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    const endpoints = [
      '/health',
      '/health/ready',
      '/health/live',
      '/metrics'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${baseUrl}${endpoint}`);
        const duration = Date.now() - startTime;
        
        const result = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          duration,
          timestamp: new Date().toISOString(),
          healthy: response.ok
        };

        if (endpoint === '/health') {
          try {
            const healthData = await response.json();
            result.healthData = healthData;
          } catch (e) {
            result.error = 'Failed to parse health response';
          }
        }

        results.push(result);
        console.log(`✅ ${endpoint}: ${response.status} (${duration}ms)`);
      } catch (error) {
        const result = {
          endpoint,
          status: 0,
          statusText: 'Connection Failed',
          duration: 0,
          timestamp: new Date().toISOString(),
          healthy: false,
          error: error.message
        };
        results.push(result);
        console.log(`❌ ${endpoint}: Connection failed - ${error.message}`);
      }
    }

    // Save results
    const reportPath = path.join(this.resultsDir, `health-check-${environment}-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    const overallHealth = results.every(r => r.healthy);
    console.log(`\n📊 Overall health: ${overallHealth ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    return { results, overallHealth, reportPath };
  }

  // Monitor test execution times
  async monitorTestTiming() {
    console.log('📊 Monitoring test execution times...');
    
    try {
      const startTime = Date.now();
      const output = execSync('npm test -- --verbose --passWithNoTests', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      const totalDuration = Date.now() - startTime;

      // Parse test results for timing information
      const lines = output.split('\n');
      const testResults = [];
      let currentSuite = null;

      lines.forEach(line => {
        // Parse Jest output for test timing
        if (line.includes('PASS') || line.includes('FAIL')) {
          const match = line.match(/(PASS|FAIL)\\s+(.+?)\\s+\\((\\d+\\.\\d+)\\s*s\\)/);
          if (match) {
            testResults.push({
              status: match[1],
              file: match[2],
              duration: parseFloat(match[3]) * 1000, // Convert to ms
              timestamp: new Date().toISOString()
            });
          }
        }
      });

      const report = {
        totalDuration,
        totalTests: testResults.length,
        passedTests: testResults.filter(t => t.status === 'PASS').length,
        failedTests: testResults.filter(t => t.status === 'FAIL').length,
        averageDuration: testResults.reduce((sum, t) => sum + t.duration, 0) / testResults.length,
        slowestTests: testResults.sort((a, b) => b.duration - a.duration).slice(0, 10),
        testResults,
        timestamp: new Date().toISOString()
      };

      const reportPath = path.join(this.metricsDir, `test-timing-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      console.log(`✅ Test timing report saved to ${reportPath}`);
      console.log(`📈 Total duration: ${totalDuration}ms`);
      console.log(`📊 Average test duration: ${report.averageDuration.toFixed(2)}ms`);
      
      return report;
    } catch (error) {
      console.error('❌ Failed to monitor test timing:', error.message);
      throw error;
    }
  }

  // Check for flaky tests
  async detectFlakyTests(runs = 5) {
    console.log(`🔍 Running flaky test detection (${runs} runs)...`);
    
    const results = [];
    
    for (let i = 0; i < runs; i++) {
      console.log(`Run ${i + 1}/${runs}...`);
      try {
        const output = execSync('npm test -- --passWithNoTests --verbose', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        // Parse test results
        const testResults = this.parseTestOutput(output);
        results.push({
          run: i + 1,
          timestamp: new Date().toISOString(),
          results: testResults
        });
      } catch (error) {
        results.push({
          run: i + 1,
          timestamp: new Date().toISOString(),
          error: error.message,
          results: []
        });
      }
    }

    // Analyze for flaky tests
    const testStability = {};
    results.forEach(run => {
      run.results.forEach(test => {
        if (!testStability[test.name]) {
          testStability[test.name] = { passes: 0, fails: 0, total: 0 };
        }
        testStability[test.name].total++;
        if (test.status === 'PASS') {
          testStability[test.name].passes++;
        } else {
          testStability[test.name].fails++;
        }
      });
    });

    // Identify flaky tests (tests that sometimes pass, sometimes fail)
    const flakyTests = Object.entries(testStability)
      .filter(([name, stats]) => stats.passes > 0 && stats.fails > 0)
      .map(([name, stats]) => ({
        name,
        stability: (stats.passes / stats.total) * 100,
        passes: stats.passes,
        fails: stats.fails,
        total: stats.total
      }))
      .sort((a, b) => a.stability - b.stability);

    const report = {
      totalRuns: runs,
      totalTests: Object.keys(testStability).length,
      flakyTests,
      stableTests: Object.keys(testStability).length - flakyTests.length,
      results,
      timestamp: new Date().toISOString()
    };

    const reportPath = path.join(this.metricsDir, `flaky-tests-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 Flaky test report saved to ${reportPath}`);
    console.log(`🎯 Found ${flakyTests.length} potentially flaky tests`);
    
    if (flakyTests.length > 0) {
      console.log('⚠️  Flaky tests detected:');
      flakyTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.stability.toFixed(1)}% stable`);
      });
    }

    return report;
  }

  parseTestOutput(output) {
    const lines = output.split('\n');
    const tests = [];
    
    lines.forEach(line => {
      // Simple parsing - in real implementation, you'd want more robust parsing
      if (line.includes('✓') || line.includes('✗')) {
        const status = line.includes('✓') ? 'PASS' : 'FAIL';
        const name = line.replace(/[✓✗]/, '').trim();
        if (name) {
          tests.push({ name, status });
        }
      }
    });
    
    return tests;
  }

  // Generate comprehensive test health report
  async generateHealthReport() {
    console.log('📋 Generating comprehensive test health report...');
    
    try {
      const [timingReport, flakyReport] = await Promise.all([
        this.monitorTestTiming(),
        this.detectFlakyTests(3)
      ]);

      // Get coverage information
      let coverageReport = null;
      try {
        execSync('npm run test:coverage', { stdio: 'pipe' });
        const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
        if (fs.existsSync(coveragePath)) {
          coverageReport = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        }
      } catch (error) {
        console.warn('⚠️  Could not generate coverage report:', error.message);
      }

      const healthReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalTests: timingReport.totalTests,
          passedTests: timingReport.passedTests,
          failedTests: timingReport.failedTests,
          flakyTests: flakyReport.flakyTests.length,
          averageTestDuration: timingReport.averageDuration,
          totalTestDuration: timingReport.totalDuration
        },
        performance: {
          slowestTests: timingReport.slowestTests,
          averageDuration: timingReport.averageDuration
        },
        stability: {
          flakyTests: flakyReport.flakyTests,
          stableTests: flakyReport.stableTests
        },
        coverage: coverageReport,
        recommendations: this.generateRecommendations(timingReport, flakyReport, coverageReport)
      };

      const reportPath = path.join(this.metricsDir, `test-health-report-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(healthReport, null, 2));

      console.log(`✅ Test health report saved to ${reportPath}`);
      return healthReport;
    } catch (error) {
      console.error('❌ Failed to generate health report:', error.message);
      throw error;
    }
  }

  generateRecommendations(timingReport, flakyReport, coverageReport) {
    const recommendations = [];

    // Performance recommendations
    if (timingReport.averageDuration > 5000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average test duration is high. Consider optimizing slow tests or running them in parallel.'
      });
    }

    // Flaky test recommendations
    if (flakyReport.flakyTests.length > 0) {
      recommendations.push({
        type: 'stability',
        priority: 'high',
        message: `Found ${flakyReport.flakyTests.length} flaky tests. These should be investigated and fixed.`
      });
    }

    // Coverage recommendations
    if (coverageReport && coverageReport.total.lines.pct < 80) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: `Test coverage is ${coverageReport.total.lines.pct}%. Consider adding more tests to reach 80%+.`
      });
    }

    return recommendations;
  }
}

// CLI interface
async function main() {
  const monitor = new TestMonitor();
  const command = process.argv[2];
  const environment = process.argv[3] || 'local';

  try {
    switch (command) {
      case 'health-check':
        await monitor.runHealthCheck(environment);
        break;
      case 'timing':
        await monitor.monitorTestTiming();
        break;
      case 'flaky':
        await monitor.detectFlakyTests();
        break;
      case 'report':
        await monitor.generateHealthReport();
        break;
      default:
        console.log('Usage: node test-monitoring.js <command> [environment]');
        console.log('Commands:');
        console.log('  health-check [env] - Run health checks');
        console.log('  timing            - Monitor test execution times');
        console.log('  flaky             - Detect flaky tests');
        console.log('  report            - Generate comprehensive health report');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TestMonitor };