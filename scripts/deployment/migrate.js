#!/usr/bin/env node

/**
 * 🗄️ Database Migration System
 * 
 * This script provides comprehensive database migration capabilities
 * for deployment pipelines including rollback support and validation.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MIGRATION_CONFIG = {
  migrationsPath: path.join(__dirname, '../../migrations'),
  backupPath: path.join(__dirname, '../../backups/migrations'),
  migrationTable: 'migration_history',
  lockTable: 'migration_locks',
  lockTimeout: 300000, // 5 minutes
  backupBeforeMigration: true,
  validateAfterMigration: true,
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
 * Database connection
 */
function createDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  return postgres(process.env.DATABASE_URL, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  });
}

/**
 * Initialize migration system
 */
async function initializeMigrationSystem(sql) {
  // Create migration history table
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(MIGRATION_CONFIG.migrationTable)} (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      version VARCHAR(50) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      execution_time INTEGER NOT NULL,
      checksum VARCHAR(64) NOT NULL,
      success BOOLEAN NOT NULL DEFAULT true,
      rollback_sql TEXT,
      metadata JSONB DEFAULT '{}'::jsonb
    )
  `;
  
  // Create migration locks table
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(MIGRATION_CONFIG.lockTable)} (
      id SERIAL PRIMARY KEY,
      lock_name VARCHAR(255) NOT NULL UNIQUE,
      locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      locked_by VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL
    )
  `;
  
  log('✅ Migration system initialized', 'green');
}

/**
 * Acquire migration lock
 */
async function acquireMigrationLock(sql, lockName = 'main') {
  const lockId = `${lockName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + MIGRATION_CONFIG.lockTimeout);
  const lockedBy = process.env.USER || process.env.USERNAME || 'unknown';
  
  try {
    // Clean up expired locks
    await sql`
      DELETE FROM ${sql(MIGRATION_CONFIG.lockTable)}
      WHERE expires_at < CURRENT_TIMESTAMP
    `;
    
    // Try to acquire lock
    await sql`
      INSERT INTO ${sql(MIGRATION_CONFIG.lockTable)} (lock_name, locked_by, expires_at)
      VALUES (${lockName}, ${lockedBy}, ${expiresAt})
    `;
    
    log(`🔒 Migration lock acquired: ${lockName}`, 'green');
    return lockId;
    
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      const [existingLock] = await sql`
        SELECT locked_by, locked_at, expires_at
        FROM ${sql(MIGRATION_CONFIG.lockTable)}
        WHERE lock_name = ${lockName}
      `;
      
      throw new Error(
        `Migration already in progress. Locked by: ${existingLock.locked_by} at ${existingLock.locked_at}`
      );
    }
    throw error;
  }
}

/**
 * Release migration lock
 */
async function releaseMigrationLock(sql, lockName = 'main') {
  await sql`
    DELETE FROM ${sql(MIGRATION_CONFIG.lockTable)}
    WHERE lock_name = ${lockName}
  `;
  
  log(`🔓 Migration lock released: ${lockName}`, 'green');
}

/**
 * Get applied migrations
 */
async function getAppliedMigrations(sql) {
  try {
    const migrations = await sql`
      SELECT migration_name, version, executed_at, success
      FROM ${sql(MIGRATION_CONFIG.migrationTable)}
      ORDER BY executed_at ASC
    `;
    
    return migrations;
  } catch (error) {
    if (error.code === '42P01') { // Table doesn't exist
      return [];
    }
    throw error;
  }
}

/**
 * Get pending migrations
 */
async function getPendingMigrations(sql) {
  const appliedMigrations = await getAppliedMigrations(sql);
  const appliedNames = new Set(appliedMigrations.map(m => m.migration_name));
  
  // Read migration files
  const migrationFiles = await fs.readdir(MIGRATION_CONFIG.migrationsPath);
  const sqlFiles = migrationFiles
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  const pendingMigrations = [];
  
  for (const file of sqlFiles) {
    const migrationName = path.parse(file).name;
    
    if (!appliedNames.has(migrationName)) {
      const filePath = path.join(MIGRATION_CONFIG.migrationsPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      pendingMigrations.push({
        name: migrationName,
        file: filePath,
        content,
        checksum: generateChecksum(content),
      });
    }
  }
  
  return pendingMigrations;
}

/**
 * Generate checksum for migration content
 */
function generateChecksum(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Create database backup
 */
async function createDatabaseBackup(backupName) {
  if (!MIGRATION_CONFIG.backupBeforeMigration) {
    return null;
  }
  
  try {
    const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
    const backupFile = path.join(
      MIGRATION_CONFIG.backupPath,
      `${backupName}-${timestamp}.sql`
    );
    
    // Ensure backup directory exists
    await fs.mkdir(path.dirname(backupFile), { recursive: true });
    
    // Create backup using pg_dump
    execSync(`pg_dump ${process.env.DATABASE_URL} > ${backupFile}`, {
      stdio: 'inherit',
    });
    
    log(`💾 Database backup created: ${backupFile}`, 'green');
    return backupFile;
    
  } catch (error) {
    log(`⚠️  Failed to create database backup: ${error.message}`, 'yellow');
    return null;
  }
}

/**
 * Apply single migration
 */
async function applyMigration(sql, migration, version = '1.0.0') {
  const startTime = Date.now();
  
  try {
    log(`🔄 Applying migration: ${migration.name}`, 'blue');
    
    // Parse migration content for UP and DOWN sections
    const { upSQL, downSQL } = parseMigrationContent(migration.content);
    
    // Execute UP migration
    await sql.unsafe(upSQL);
    
    const executionTime = Date.now() - startTime;
    
    // Record migration in history
    await sql`
      INSERT INTO ${sql(MIGRATION_CONFIG.migrationTable)} (
        migration_name,
        version,
        execution_time,
        checksum,
        rollback_sql,
        success
      ) VALUES (
        ${migration.name},
        ${version},
        ${executionTime},
        ${migration.checksum},
        ${downSQL || null},
        true
      )
    `;
    
    log(`✅ Migration applied successfully: ${migration.name} (${executionTime}ms)`, 'green');
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Record failed migration
    try {
      await sql`
        INSERT INTO ${sql(MIGRATION_CONFIG.migrationTable)} (
          migration_name,
          version,
          execution_time,
          checksum,
          success,
          metadata
        ) VALUES (
          ${migration.name},
          ${version},
          ${executionTime},
          ${migration.checksum},
          false,
          ${JSON.stringify({ error: error.message })}
        )
      `;
    } catch (recordError) {
      log(`⚠️  Failed to record migration failure: ${recordError.message}`, 'yellow');
    }
    
    throw new Error(`Migration failed: ${migration.name} - ${error.message}`);
  }
}

/**
 * Parse migration content for UP and DOWN sections
 */
function parseMigrationContent(content) {
  const lines = content.split('\n');
  let upSQL = [];
  let downSQL = [];
  let currentSection = 'up';
  
  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    
    if (trimmedLine.startsWith('-- up') || trimmedLine.startsWith('/* up')) {
      currentSection = 'up';
      continue;
    }
    
    if (trimmedLine.startsWith('-- down') || trimmedLine.startsWith('/* down')) {
      currentSection = 'down';
      continue;
    }
    
    if (currentSection === 'up') {
      upSQL.push(line);
    } else if (currentSection === 'down') {
      downSQL.push(line);
    }
  }
  
  return {
    upSQL: upSQL.join('\n').trim(),
    downSQL: downSQL.join('\n').trim() || null,
  };
}

/**
 * Rollback single migration
 */
async function rollbackMigration(sql, migrationName) {
  try {
    log(`🔄 Rolling back migration: ${migrationName}`, 'blue');
    
    // Get rollback SQL from migration history
    const [migration] = await sql`
      SELECT rollback_sql, executed_at
      FROM ${sql(MIGRATION_CONFIG.migrationTable)}
      WHERE migration_name = ${migrationName}
      AND success = true
      ORDER BY executed_at DESC
      LIMIT 1
    `;
    
    if (!migration) {
      throw new Error(`Migration ${migrationName} not found or not successfully applied`);
    }
    
    if (!migration.rollback_sql) {
      throw new Error(`No rollback SQL available for migration ${migrationName}`);
    }
    
    // Execute rollback SQL
    await sql.unsafe(migration.rollback_sql);
    
    // Remove migration from history
    await sql`
      DELETE FROM ${sql(MIGRATION_CONFIG.migrationTable)}
      WHERE migration_name = ${migrationName}
    `;
    
    log(`✅ Migration rolled back successfully: ${migrationName}`, 'green');
    
  } catch (error) {
    throw new Error(`Rollback failed: ${migrationName} - ${error.message}`);
  }
}

/**
 * Validate database schema
 */
async function validateDatabaseSchema(sql) {
  if (!MIGRATION_CONFIG.validateAfterMigration) {
    return true;
  }
  
  try {
    log('🔍 Validating database schema...', 'blue');
    
    // Basic validation queries
    const validationQueries = [
      // Check for missing indexes
      `SELECT schemaname, tablename, attname
       FROM pg_catalog.pg_stats
       WHERE schemaname = 'public' AND n_distinct > 100 AND correlation < 0.1
       LIMIT 5`,
      
      // Check for tables without primary keys
      `SELECT t.table_name
       FROM information_schema.tables t
       LEFT JOIN information_schema.table_constraints tc
         ON t.table_name = tc.table_name AND tc.constraint_type = 'PRIMARY KEY'
       WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
         AND tc.constraint_name IS NULL`,
    ];
    
    for (const query of validationQueries) {
      await sql.unsafe(query);
    }
    
    log('✅ Database schema validation passed', 'green');
    return true;
    
  } catch (error) {
    log(`⚠️  Database schema validation failed: ${error.message}`, 'yellow');
    return false;
  }
}

/**
 * Run migrations
 */
async function runMigrations(options = {}) {
  const {
    version = '1.0.0',
    dryRun = false,
    force = false,
    target = null,
  } = options;
  
  const sql = createDatabaseConnection();
  let lockAcquired = false;
  let backupFile = null;
  
  try {
    // Initialize migration system
    await initializeMigrationSystem(sql);
    
    // Acquire migration lock
    await acquireMigrationLock(sql);
    lockAcquired = true;
    
    // Get pending migrations
    const pendingMigrations = await getPendingMigrations(sql);
    
    if (pendingMigrations.length === 0) {
      log('✅ No pending migrations found', 'green');
      return { applied: 0, success: true };
    }
    
    log(`📋 Found ${pendingMigrations.length} pending migrations:`, 'cyan');
    pendingMigrations.forEach((migration, index) => {
      log(`  ${index + 1}. ${migration.name}`, 'blue');
    });
    
    if (dryRun) {
      log('🧪 DRY RUN MODE - No actual migrations will be applied', 'yellow');
      return { applied: 0, success: true };
    }
    
    // Create backup before migrations
    backupFile = await createDatabaseBackup('pre-migration');
    
    // Apply migrations
    let appliedCount = 0;
    
    for (const migration of pendingMigrations) {
      // Check if we should stop at target migration
      if (target && migration.name === target) {
        log(`🎯 Reached target migration: ${target}`, 'cyan');
        break;
      }
      
      await applyMigration(sql, migration, version);
      appliedCount++;
    }
    
    // Validate database after migrations
    const isValid = await validateDatabaseSchema(sql);
    
    if (!isValid && !force) {
      throw new Error('Database validation failed after migrations');
    }
    
    log(`🎉 Successfully applied ${appliedCount} migrations`, 'green');
    
    return { applied: appliedCount, success: true, backup: backupFile };
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'red');
    
    // If we have a backup, offer to restore
    if (backupFile && !dryRun) {
      log(`💾 Backup available at: ${backupFile}`, 'cyan');
      log('To restore: psql $DATABASE_URL < ' + backupFile, 'cyan');
    }
    
    throw error;
    
  } finally {
    if (lockAcquired) {
      await releaseMigrationLock(sql);
    }
    await sql.end();
  }
}

/**
 * Show migration status
 */
async function showMigrationStatus() {
  const sql = createDatabaseConnection();
  
  try {
    await initializeMigrationSystem(sql);
    
    const appliedMigrations = await getAppliedMigrations(sql);
    const pendingMigrations = await getPendingMigrations(sql);
    
    log('📊 MIGRATION STATUS', 'bright');
    log('=' .repeat(50), 'blue');
    
    if (appliedMigrations.length > 0) {
      log('\n✅ Applied Migrations:', 'green');
      appliedMigrations.forEach((migration, index) => {
        const status = migration.success ? '✅' : '❌';
        log(`  ${status} ${migration.migration_name} (${migration.executed_at})`, 'blue');
      });
    }
    
    if (pendingMigrations.length > 0) {
      log('\n⏳ Pending Migrations:', 'yellow');
      pendingMigrations.forEach((migration, index) => {
        log(`  📄 ${migration.name}`, 'yellow');
      });
    } else {
      log('\n✅ All migrations applied', 'green');
    }
    
    log(`\nTotal Applied: ${appliedMigrations.length}`, 'cyan');
    log(`Total Pending: ${pendingMigrations.length}`, 'cyan');
    
  } finally {
    await sql.end();
  }
}

/**
 * CLI interface
 */
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'up':
      case 'migrate':
        const upOptions = {
          dryRun: process.argv.includes('--dry-run'),
          force: process.argv.includes('--force'),
          target: process.argv.find(arg => arg.startsWith('--target='))?.split('=')[1],
          version: process.argv.find(arg => arg.startsWith('--version='))?.split('=')[1] || '1.0.0',
        };
        await runMigrations(upOptions);
        break;
        
      case 'status':
        await showMigrationStatus();
        break;
        
      case 'rollback':
        const migrationName = process.argv[3];
        if (!migrationName) {
          log('❌ Please specify migration name to rollback', 'red');
          process.exit(1);
        }
        
        const sql = createDatabaseConnection();
        try {
          await rollbackMigration(sql, migrationName);
        } finally {
          await sql.end();
        }
        break;
        
      default:
        log('Usage:', 'cyan');
        log('  node migrate.js up [options]         # Apply pending migrations', 'blue');
        log('  node migrate.js status               # Show migration status', 'blue');
        log('  node migrate.js rollback <name>      # Rollback specific migration', 'blue');
        log('', 'reset');
        log('Options:', 'cyan');
        log('  --dry-run              # Show what would be done without applying', 'blue');
        log('  --force                # Continue even if validation fails', 'blue');
        log('  --target=<name>        # Stop at specific migration', 'blue');
        log('  --version=<version>    # Set migration version', 'blue');
        break;
    }
  } catch (error) {
    log(`❌ Command failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run CLI if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  runMigrations,
  showMigrationStatus,
  rollbackMigration,
};
