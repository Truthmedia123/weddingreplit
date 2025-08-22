#!/usr/bin/env node

/**
 * 💾 Backup and Recovery System
 * 
 * This script provides comprehensive backup and recovery capabilities
 * for the wedding invitation application including database, files, and configuration.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup Configuration
const BACKUP_CONFIG = {
  backupPath: path.join(__dirname, '../../backups'),
  retention: {
    daily: 7,      // Keep 7 daily backups
    weekly: 4,     // Keep 4 weekly backups
    monthly: 12,   // Keep 12 monthly backups
  },
  compression: {
    enabled: true,
    level: 6,
  },
  encryption: {
    enabled: process.env.BACKUP_ENCRYPTION_KEY !== undefined,
    algorithm: 'aes-256-gcm',
  },
  notifications: {
    enabled: true,
    webhook: process.env.BACKUP_WEBHOOK_URL,
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
 * Create database backup
 */
async function createDatabaseBackup(backupName: string): Promise<string> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
  const backupFile = path.join(
    BACKUP_CONFIG.backupPath,
    'database',
    `${backupName}-${timestamp}.sql`
  );

  // Ensure backup directory exists
  await fs.mkdir(path.dirname(backupFile), { recursive: true });

  try {
    log('🗄️  Creating database backup...', 'blue');

    // Create database backup using pg_dump
    execSync(`pg_dump ${process.env.DATABASE_URL} > ${backupFile}`, {
      stdio: 'inherit',
    });

    // Compress backup if enabled
    if (BACKUP_CONFIG.compression.enabled) {
      const compressedFile = `${backupFile}.gz`;
      execSync(`gzip -${BACKUP_CONFIG.compression.level} ${backupFile}`, {
        stdio: 'inherit',
      });
      
      log(`✅ Database backup created: ${compressedFile}`, 'green');
      return compressedFile;
    }

    log(`✅ Database backup created: ${backupFile}`, 'green');
    return backupFile;

  } catch (error) {
    log(`❌ Database backup failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Create file system backup
 */
async function createFileBackup(backupName: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
  const backupFile = path.join(
    BACKUP_CONFIG.backupPath,
    'files',
    `${backupName}-${timestamp}.tar.gz`
  );

  // Ensure backup directory exists
  await fs.mkdir(path.dirname(backupFile), { recursive: true });

  try {
    log('📁 Creating file system backup...', 'blue');

    // Create tar archive of important directories
    const excludePatterns = [
      '--exclude=node_modules',
      '--exclude=.git',
      '--exclude=*.log',
      '--exclude=backups',
      '--exclude=temp',
      '--exclude=dist',
    ];

    const sourceDirs = [
      'client/src',
      'server',
      'shared',
      'config',
      'migrations',
      'package.json',
      'package-lock.json',
    ];

    const tarCommand = `tar -czf ${backupFile} ${excludePatterns.join(' ')} ${sourceDirs.join(' ')}`;
    execSync(tarCommand, { stdio: 'inherit' });

    log(`✅ File backup created: ${backupFile}`, 'green');
    return backupFile;

  } catch (error) {
    log(`❌ File backup failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Create configuration backup
 */
async function createConfigBackup(backupName: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
  const backupFile = path.join(
    BACKUP_CONFIG.backupPath,
    'config',
    `${backupName}-${timestamp}.json`
  );

  // Ensure backup directory exists
  await fs.mkdir(path.dirname(backupFile), { recursive: true });

  try {
    log('⚙️  Creating configuration backup...', 'blue');

    const config = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        url: process.env.DATABASE_URL ? '***REDACTED***' : undefined,
        ssl: process.env.NODE_ENV === 'production',
      },
      cdn: {
        baseUrl: process.env.CDN_BASE_URL,
        enabled: process.env.NODE_ENV === 'production',
      },
      ssl: {
        certPath: process.env.SSL_CERT_PATH,
        keyPath: process.env.SSL_KEY_PATH,
      },
      monitoring: {
        healthCheckUrl: process.env.HEALTH_CHECK_URL,
      },
      backup: {
        retention: BACKUP_CONFIG.retention,
        compression: BACKUP_CONFIG.compression,
        encryption: BACKUP_CONFIG.encryption,
      },
    };

    await fs.writeFile(backupFile, JSON.stringify(config, null, 2));
    log(`✅ Configuration backup created: ${backupFile}`, 'green');
    return backupFile;

  } catch (error) {
    log(`❌ Configuration backup failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Encrypt backup file
 */
async function encryptBackup(filePath: string): Promise<string> {
  if (!BACKUP_CONFIG.encryption.enabled || !process.env.BACKUP_ENCRYPTION_KEY) {
    return filePath;
  }

  try {
    const encryptedFile = `${filePath}.enc`;
    const key = process.env.BACKUP_ENCRYPTION_KEY;

    // Encrypt file using OpenSSL
    execSync(`openssl enc -${BACKUP_CONFIG.encryption.algorithm} -k "${key}" -in "${filePath}" -out "${encryptedFile}"`, {
      stdio: 'inherit',
    });

    // Remove original file
    await fs.unlink(filePath);

    log(`🔒 Backup encrypted: ${encryptedFile}`, 'green');
    return encryptedFile;

  } catch (error) {
    log(`❌ Backup encryption failed: ${error.message}`, 'red');
    return filePath; // Return original file if encryption fails
  }
}

/**
 * Create comprehensive backup
 */
async function createFullBackup(backupName: string = 'full'): Promise<{
  database: string;
  files: string;
  config: string;
  metadata: any;
}> {
  const startTime = Date.now();
  const backupId = `${backupName}-${Date.now()}`;

  log(`🚀 Starting full backup: ${backupId}`, 'cyan');

  try {
    // Create all backups in parallel
    const [databaseBackup, fileBackup, configBackup] = await Promise.all([
      createDatabaseBackup(backupId),
      createFileBackup(backupId),
      createConfigBackup(backupId),
    ]);

    // Encrypt backups if enabled
    const [encryptedDb, encryptedFiles, encryptedConfig] = await Promise.all([
      encryptBackup(databaseBackup),
      encryptBackup(fileBackup),
      encryptBackup(configBackup),
    ]);

    const duration = Date.now() - startTime;
    const metadata = {
      backupId,
      timestamp: new Date().toISOString(),
      duration,
      size: {
        database: await getFileSize(encryptedDb),
        files: await getFileSize(encryptedFiles),
        config: await getFileSize(encryptedConfig),
      },
      checksums: {
        database: await generateChecksum(encryptedDb),
        files: await generateChecksum(encryptedFiles),
        config: await generateChecksum(encryptedConfig),
      },
    };

    // Save backup metadata
    const metadataFile = path.join(
      BACKUP_CONFIG.backupPath,
      'metadata',
      `${backupId}-metadata.json`
    );
    await fs.mkdir(path.dirname(metadataFile), { recursive: true });
    await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));

    log(`🎉 Full backup completed in ${duration}ms`, 'green');
    log(`📊 Total size: ${formatBytes(metadata.size.database + metadata.size.files + metadata.size.config)}`, 'cyan');

    // Send notification
    if (BACKUP_CONFIG.notifications.enabled) {
      await sendBackupNotification(metadata, 'success');
    }

    return {
      database: encryptedDb,
      files: encryptedFiles,
      config: encryptedConfig,
      metadata,
    };

  } catch (error) {
    log(`❌ Full backup failed: ${error.message}`, 'red');

    // Send failure notification
    if (BACKUP_CONFIG.notifications.enabled) {
      await sendBackupNotification({ error: error.message }, 'failure');
    }

    throw error;
  }
}

/**
 * Restore database from backup
 */
async function restoreDatabase(backupPath: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  try {
    log('🔄 Restoring database...', 'blue');

    let restoreFile = backupPath;

    // Decrypt if encrypted
    if (backupPath.endsWith('.enc')) {
      const decryptedFile = backupPath.replace('.enc', '');
      const key = process.env.BACKUP_ENCRYPTION_KEY;
      
      if (!key) {
        throw new Error('BACKUP_ENCRYPTION_KEY required for encrypted backup');
      }

      execSync(`openssl enc -${BACKUP_CONFIG.encryption.algorithm} -d -k "${key}" -in "${backupPath}" -out "${decryptedFile}"`, {
        stdio: 'inherit',
      });
      
      restoreFile = decryptedFile;
    }

    // Decompress if compressed
    if (restoreFile.endsWith('.gz')) {
      const uncompressedFile = restoreFile.replace('.gz', '');
      execSync(`gunzip ${restoreFile}`, { stdio: 'inherit' });
      restoreFile = uncompressedFile;
    }

    // Restore database
    execSync(`psql ${process.env.DATABASE_URL} < ${restoreFile}`, {
      stdio: 'inherit',
    });

    // Clean up temporary files
    if (restoreFile !== backupPath) {
      await fs.unlink(restoreFile);
    }

    log('✅ Database restored successfully', 'green');

  } catch (error) {
    log(`❌ Database restore failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Restore files from backup
 */
async function restoreFiles(backupPath: string, targetDir: string = '.'): Promise<void> {
  try {
    log('🔄 Restoring files...', 'blue');

    let restoreFile = backupPath;

    // Decrypt if encrypted
    if (backupPath.endsWith('.enc')) {
      const decryptedFile = backupPath.replace('.enc', '');
      const key = process.env.BACKUP_ENCRYPTION_KEY;
      
      if (!key) {
        throw new Error('BACKUP_ENCRYPTION_KEY required for encrypted backup');
      }

      execSync(`openssl enc -${BACKUP_CONFIG.encryption.algorithm} -d -k "${key}" -in "${backupPath}" -out "${decryptedFile}"`, {
        stdio: 'inherit',
      });
      
      restoreFile = decryptedFile;
    }

    // Extract tar archive
    execSync(`tar -xzf ${restoreFile} -C ${targetDir}`, {
      stdio: 'inherit',
    });

    // Clean up temporary files
    if (restoreFile !== backupPath) {
      await fs.unlink(restoreFile);
    }

    log('✅ Files restored successfully', 'green');

  } catch (error) {
    log(`❌ File restore failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * List available backups
 */
async function listBackups(): Promise<{
  database: string[];
  files: string[];
  config: string[];
  metadata: string[];
}> {
  try {
    const backupDir = BACKUP_CONFIG.backupPath;
    const subdirs = ['database', 'files', 'config', 'metadata'];

    const backups: any = {};
    
    for (const subdir of subdirs) {
      const subdirPath = path.join(backupDir, subdir);
      try {
        const files = await fs.readdir(subdirPath);
        backups[subdir] = files
          .filter(file => !file.startsWith('.'))
          .sort()
          .reverse(); // Most recent first
      } catch {
        backups[subdir] = [];
      }
    }

    return backups;

  } catch (error) {
    log(`❌ Failed to list backups: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Clean up old backups based on retention policy
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    log('🧹 Cleaning up old backups...', 'blue');

    const backups = await listBackups();
    const now = new Date();
    let deletedCount = 0;

    for (const [type, files] of Object.entries(backups)) {
      for (const file of files) {
        const filePath = path.join(BACKUP_CONFIG.backupPath, type, file);
        const stats = await fs.stat(filePath);
        const ageInDays = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

        let shouldDelete = false;

        // Apply retention policy
        if (ageInDays > BACKUP_CONFIG.retention.monthly * 30) {
          shouldDelete = true;
        } else if (ageInDays > BACKUP_CONFIG.retention.weekly * 7) {
          // Keep only weekly backups
          const weekNumber = Math.floor(ageInDays / 7);
          if (weekNumber > BACKUP_CONFIG.retention.weekly) {
            shouldDelete = true;
          }
        } else if (ageInDays > BACKUP_CONFIG.retention.daily) {
          // Keep only daily backups
          shouldDelete = true;
        }

        if (shouldDelete) {
          await fs.unlink(filePath);
          deletedCount++;
          log(`🗑️  Deleted old backup: ${file}`, 'yellow');
        }
      }
    }

    log(`✅ Cleanup completed. Deleted ${deletedCount} old backups`, 'green');

  } catch (error) {
    log(`❌ Cleanup failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Utility functions
 */
async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function generateChecksum(filePath: string): Promise<string> {
  try {
    const crypto = require('crypto');
    const data = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch {
    return '';
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function sendBackupNotification(metadata: any, status: 'success' | 'failure'): Promise<void> {
  if (!BACKUP_CONFIG.notifications.webhook) {
    return;
  }

  try {
    const message = {
      text: status === 'success' 
        ? `✅ Backup completed successfully\nDuration: ${metadata.duration}ms\nSize: ${formatBytes(metadata.size.database + metadata.size.files + metadata.size.config)}`
        : `❌ Backup failed\nError: ${metadata.error}`,
      timestamp: new Date().toISOString(),
    };

    await fetch(BACKUP_CONFIG.notifications.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

  } catch (error) {
    log(`⚠️  Failed to send notification: ${error.message}`, 'yellow');
  }
}

/**
 * CLI interface
 */
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'create':
        const backupName = process.argv[3] || 'manual';
        await createFullBackup(backupName);
        break;
        
      case 'list':
        const backups = await listBackups();
        log('📋 Available Backups:', 'cyan');
        log('=' .repeat(50), 'blue');
        
        for (const [type, files] of Object.entries(backups)) {
          log(`\n${type.toUpperCase()}:`, 'bright');
          files.forEach(file => log(`  📄 ${file}`, 'blue'));
        }
        break;
        
      case 'restore':
        const restoreType = process.argv[3];
        const backupPath = process.argv[4];
        
        if (!restoreType || !backupPath) {
          log('❌ Usage: node backup.js restore <database|files> <backup-path>', 'red');
          process.exit(1);
        }
        
        if (restoreType === 'database') {
          await restoreDatabase(backupPath);
        } else if (restoreType === 'files') {
          await restoreFiles(backupPath);
        } else {
          log('❌ Invalid restore type. Use "database" or "files"', 'red');
          process.exit(1);
        }
        break;
        
      case 'cleanup':
        await cleanupOldBackups();
        break;
        
      default:
        log('Usage:', 'cyan');
        log('  node backup.js create [name]        # Create full backup', 'blue');
        log('  node backup.js list                 # List available backups', 'blue');
        log('  node backup.js restore <type> <path> # Restore from backup', 'blue');
        log('  node backup.js cleanup              # Clean up old backups', 'blue');
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
  createFullBackup,
  createDatabaseBackup,
  createFileBackup,
  createConfigBackup,
  restoreDatabase,
  restoreFiles,
  listBackups,
  cleanupOldBackups,
};
