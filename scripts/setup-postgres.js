#!/usr/bin/env node

/**
 * PostgreSQL Database Setup Script
 * 
 * This script helps set up a local PostgreSQL database for development.
 * It can either connect to an existing PostgreSQL instance or help set up Docker.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🐘 PostgreSQL Database Setup for Goan Wedding Directory\n');

// Check if PostgreSQL is installed locally
function checkPostgreSQL() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL is installed locally');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL not found locally');
    return false;
  }
}

// Check if Docker is available
function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker is available');
    return true;
  } catch (error) {
    console.log('❌ Docker not found');
    return false;
  }
}

// Create database using local PostgreSQL
function createLocalDatabase() {
  try {
    console.log('📝 Creating database "goan_wedding_db"...');
    
    // Try to create database (this might fail if it already exists, which is fine)
    try {
      execSync('createdb goan_wedding_db', { stdio: 'pipe' });
      console.log('✅ Database "goan_wedding_db" created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Database "goan_wedding_db" already exists');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    return false;
  }
}

// Setup Docker PostgreSQL
function setupDockerPostgreSQL() {
  console.log('🐳 Setting up PostgreSQL with Docker...');
  
  const dockerCompose = `version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: goan_wedding_postgres
    environment:
      POSTGRES_DB: goan_wedding_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
`;

  // Write docker-compose.yml
  fs.writeFileSync('docker-compose.yml', dockerCompose);
  console.log('📝 Created docker-compose.yml');
  
  try {
    console.log('🚀 Starting PostgreSQL container...');
    execSync('docker-compose up -d postgres', { stdio: 'inherit' });
    console.log('✅ PostgreSQL container started successfully');
    
    // Wait a moment for PostgreSQL to be ready
    console.log('⏳ Waiting for PostgreSQL to be ready...');
    setTimeout(() => {
      console.log('✅ PostgreSQL should be ready now');
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to start PostgreSQL container:', error.message);
    return false;
  }
}

// Main setup function
async function main() {
  const hasPostgreSQL = checkPostgreSQL();
  const hasDocker = checkDocker();
  
  console.log('');
  
  if (hasPostgreSQL) {
    console.log('🎯 Using local PostgreSQL installation');
    const success = createLocalDatabase();
    if (success) {
      console.log('\n✅ Database setup complete!');
      console.log('🔗 Connection string: postgresql://postgres:password@localhost:5432/goan_wedding_db');
      console.log('\n📝 Next steps:');
      console.log('1. Make sure your .env file has the correct DATABASE_URL');
      console.log('2. Run: npm run db:push');
      console.log('3. Run: npm run db:seed');
    }
  } else if (hasDocker) {
    console.log('🎯 Using Docker for PostgreSQL');
    const success = setupDockerPostgreSQL();
    if (success) {
      console.log('\n✅ Docker PostgreSQL setup complete!');
      console.log('🔗 Connection string: postgresql://postgres:password@localhost:5432/goan_wedding_db');
      console.log('\n📝 Next steps:');
      console.log('1. Wait 10 seconds for PostgreSQL to fully start');
      console.log('2. Run: npm run db:push');
      console.log('3. Run: npm run db:seed');
    }
  } else {
    console.log('❌ Neither PostgreSQL nor Docker found');
    console.log('\n📝 Please install one of the following:');
    console.log('1. PostgreSQL: https://www.postgresql.org/download/');
    console.log('2. Docker: https://www.docker.com/get-started');
    console.log('\nThen run this script again.');
  }
}

main().catch(console.error);