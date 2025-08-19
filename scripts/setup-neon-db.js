#!/usr/bin/env node

/**
 * Neon PostgreSQL Database Setup Guide
 * 
 * This script provides instructions for setting up a free Neon PostgreSQL database
 */

console.log('🐘 Neon PostgreSQL Database Setup for Goan Wedding Directory\n');

console.log('📝 Follow these steps to set up your free PostgreSQL database:\n');

console.log('1. 🌐 Go to https://neon.tech');
console.log('2. 📧 Sign up for a free account (no credit card required)');
console.log('3. ➕ Create a new project');
console.log('4. 📋 Copy the connection string from the dashboard');
console.log('5. 📝 Update your .env file with the connection string\n');

console.log('Example .env update:');
console.log('DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require\n');

console.log('After updating .env, run:');
console.log('npm run db:push    # Create tables');
console.log('npm run db:seed    # Add sample data\n');

console.log('🎯 Neon provides:');
console.log('- Free PostgreSQL database (up to 512MB)');
console.log('- Automatic backups');
console.log('- SSL connections');
console.log('- No server management needed\n');

console.log('✅ Once set up, your database will work in both development and production!');