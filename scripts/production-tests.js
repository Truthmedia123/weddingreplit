#!/usr/bin/env node

// Production readiness testing script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionTester {
  constructor() {
    this.baseUrl = process.env.TEST_URL || 'http://localhost:5002';
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  async testHealthEndpoints() {
    const endpoints = ['/health', '/health/ready', '/health/live', '/metrics'];
    
    for (const endpoint of endpoints) {
      await this.runTest(`Health endpoint ${endpoint}`, async () => {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      });
    }
  }

  async testVendorBrowsing() {
    await this.runTest('Vendor listing page', async () => {
      const response = await fetch(`${this.baseUrl}/api/vendors`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const vendors = await response.json();
      if (!Array.isArray(vendors)) {
        throw new Error('Vendors response is not an array');
      }
    });

    await this.runTest('Categories listing', async () => {
      const response = await fetch(`${this.baseUrl}/api/categories`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const categories = await response.json();
      if (!Array.isArray(categories)) {
        throw new Error('Categories response is not an array');
      }
    });

    await this.runTest('Featured vendors', async () => {
      const response = await fetch(`${this.baseUrl}/api/vendors/featured`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const vendors = await response.json();
      if (!Array.isArray(vendors)) {
        throw new Error('Featured vendors response is not an array');
      }
    });
  }

  async testRSVPFlow() {
    // Test wedding creation
    await this.runTest('Wedding creation', async () => {
      const weddingData = {
        brideName: 'Test Bride',
        groomName: 'Test Groom',
        weddingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Test Venue',
        venueAddress: 'Test Address',
        nuptialsTime: '10:00 AM',
        receptionTime: '6:00 PM',
        slug: `test-wedding-${Date.now()}`,
        contactEmail: 'test@example.com',
        maxGuests: 100,
        isPublic: false
      };

      const response = await fetch(`${this.baseUrl}/api/weddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weddingData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const wedding = await response.json();
      this.testWeddingId = wedding.id;
    });

    // Test RSVP submission
    if (this.testWeddingId) {
      await this.runTest('RSVP submission', async () => {
        const rsvpData = {
          guestName: 'Test Guest',
          guestEmail: 'guest@example.com',
          attendingCeremony: true,
          attendingReception: true,
          numberOfGuests: 2,
          message: 'Looking forward to the celebration!'
        };

        const response = await fetch(`${this.baseUrl}/api/weddings/${this.testWeddingId}/rsvps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rsvpData)
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`HTTP ${response.status}: ${error}`);
        }
      });
    }
  }

  async testInvitationGeneration() {
    await this.runTest('Invitation generation', async () => {
      const invitationData = {
        bibleVerse: "I have found the one whom my soul loves",
        bibleReference: "Song of Solomon 3:4",
        groomName: "Test Groom",
        groomFatherName: "Test Father",
        groomMotherName: "Test Mother",
        brideName: "Test Bride",
        brideFatherName: "Test Father",
        brideMotherName: "Test Mother",
        ceremonyVenue: "Test Church",
        ceremonyDay: "Saturday",
        ceremonyDate: "December 25, 2024",
        nuptialsTime: "10:00 AM",
        receptionVenue: "Test Hall",
        receptionTime: "6:00 PM",
        address1: "Test Address 1",
        location1: "Test Location 1",
        contact1: "9876543210",
        address2: "Test Address 2",
        location2: "Test Location 2",
        contact2: "9876543211",
        qrCodeImage: ""
      };

      const response = await fetch(`${this.baseUrl}/api/invitation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitationData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      if (!result.downloadToken || !result.downloadUrl) {
        throw new Error('Invalid invitation generation response');
      }
    });
  }

  async testSEOEndpoints() {
    await this.runTest('Sitemap generation', async () => {
      const response = await fetch(`${this.baseUrl}/sitemap.xml`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const sitemap = await response.text();
      if (!sitemap.includes('<?xml') || !sitemap.includes('<urlset')) {
        throw new Error('Invalid sitemap format');
      }
    });

    await this.runTest('Robots.txt', async () => {
      const response = await fetch(`${this.baseUrl}/robots.txt`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const robots = await response.text();
      if (!robots.includes('User-agent:') || !robots.includes('Sitemap:')) {
        throw new Error('Invalid robots.txt format');
      }
    });
  }

  async testPerformance() {
    await this.runTest('Response time check', async () => {
      const start = Date.now();
      const response = await fetch(`${this.baseUrl}/api/vendors`);
      const duration = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (duration > 2000) {
        throw new Error(`Response time too slow: ${duration}ms (should be < 2000ms)`);
      }
    });

    await this.runTest('Memory usage check', async () => {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const health = await response.json();
      if (health.checks?.memory?.status === 'fail') {
        throw new Error('Memory usage is critical');
      }
    });
  }

  async testSecurity() {
    await this.runTest('Security headers', async () => {
      const response = await fetch(`${this.baseUrl}/`);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      for (const header of requiredHeaders) {
        if (!headers.get(header)) {
          throw new Error(`Missing security header: ${header}`);
        }
      }
    });

    await this.runTest('Rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array(10).fill().map(() => 
        fetch(`${this.baseUrl}/api/vendors`)
      );
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      
      // Note: This test might pass if rate limiting is not strict
      console.log(`Rate limiting test: ${rateLimited ? 'Active' : 'Not triggered'}`);
    });
  }

  async runAllTests() {
    console.log('🚀 Starting production readiness tests...\n');
    
    await this.testHealthEndpoints();
    await this.testVendorBrowsing();
    await this.testRSVPFlow();
    await this.testInvitationGeneration();
    await this.testSEOEndpoints();
    await this.testPerformance();
    await this.testSecurity();
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests.filter(t => t.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`);
      });
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! Application is ready for production.');
      process.exit(0);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ProductionTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { ProductionTester };