#!/usr/bin/env node

/**
 * 🔄 Automated Rollback System
 * 
 * This script provides automated rollback capabilities for deployments
 * including application code, database migrations, and static assets.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROLLBACK_CONFIG = {
  maxVersionsToKeep: 10,
  backupPath: path.join(__dirname, '../../backups'),
  deploymentHistoryPath: path.join(__dirname, '../../deployment-history.json'),
  healthCheckUrl: process.env.HEALTH_CHECK_URL || 'http://localhost:5002/health',
  healthCheckTimeout: 30000, // 30 seconds
  rollbackTimeout: 300000, // 5 minutes
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
 * Load deployment history
 */
async function loadDeploymentHistory() {
  try {
    const data = await fs.readFile(ROLLBACK_CONFIG.deploymentHistoryPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log('No deployment history found, creating new one...', 'yellow');
    return { deployments: [] };
  }
}

/**
 * Save deployment history
 */
async function saveDeploymentHistory(history) {
  await fs.mkdir(path.dirname(ROLLBACK_CONFIG.deploymentHistoryPath), { recursive: true });
  await fs.writeFile(
    ROLLBACK_CONFIG.deploymentHistoryPath,
    JSON.stringify(history, null, 2)
  );
}

/**
 * Record a new deployment
 */
async function recordDeployment(version, environment, metadata = {}) {
  const history = await loadDeploymentHistory();
  
  const deployment = {
    id: generateDeploymentId(),
    version,
    environment,
    timestamp: new Date().toISOString(),
    status: 'deployed',
    metadata: {
      commitHash: await getGitCommitHash(),
      branch: await getGitBranch(),
      deployer: process.env.USER || process.env.USERNAME || 'unknown',
      ...metadata,
    },
    rollbackInfo: {
      applicationBackup: path.join(ROLLBACK_CONFIG.backupPath, `app-${version}-${Date.now()}.tar.gz`),
      databaseBackup: path.join(ROLLBACK_CONFIG.backupPath, `db-${version}-${Date.now()}.sql`),
      configBackup: path.join(ROLLBACK_CONFIG.backupPath, `config-${version}-${Date.now()}.json`),
    },
  };
  
  history.deployments.unshift(deployment);
  
  // Keep only the last N deployments
  if (history.deployments.length > ROLLBACK_CONFIG.maxVersionsToKeep) {
    const removed = history.deployments.splice(ROLLBACK_CONFIG.maxVersionsToKeep);
    // Clean up old backups
    for (const old of removed) {
      await cleanupBackups(old.rollbackInfo);
    }
  }
  
  await saveDeploymentHistory(history);
  return deployment;
}

/**
 * Get list of available rollback targets
 */
async function getRollbackTargets(environment) {
  const history = await loadDeploymentHistory();
  return history.deployments
    .filter(d => d.environment === environment && d.status === 'deployed')
    .slice(1); // Exclude current deployment
}

/**
 * Perform rollback to specific version
 */
async function performRollback(targetDeployment, options = {}) {
  const {
    skipHealthCheck = false,
    skipDatabaseRollback = false,
    dryRun = false,
  } = options;
  
  log(`🔄 Starting rollback to version ${targetDeployment.version}...`, 'cyan');
  
  if (dryRun) {
    log('🧪 DRY RUN MODE - No actual changes will be made', 'yellow');
  }
  
  try {
    // 1. Pre-rollback health check
    if (!skipHealthCheck) {
      log('🏥 Performing pre-rollback health check...', 'blue');
      const isHealthy = await performHealthCheck();
      if (!isHealthy) {
        log('⚠️  Application is currently unhealthy, proceeding with rollback...', 'yellow');
      }
    }
    
    // 2. Create backup of current state
    log('💾 Creating backup of current state...', 'blue');
    if (!dryRun) {
      await createCurrentStateBackup();
    }
    
    // 3. Rollback application code
    log('📦 Rolling back application code...', 'blue');
    if (!dryRun) {
      await rollbackApplicationCode(targetDeployment);
    }
    
    // 4. Rollback database if needed
    if (!skipDatabaseRollback) {
      log('🗄️  Rolling back database...', 'blue');
      if (!dryRun) {
        await rollbackDatabase(targetDeployment);
      }
    }
    
    // 5. Restart services
    log('🔄 Restarting services...', 'blue');
    if (!dryRun) {
      await restartServices();
    }
    
    // 6. Post-rollback health check
    log('🏥 Performing post-rollback health check...', 'blue');
    if (!dryRun) {
      const isHealthy = await performHealthCheck();
      if (!isHealthy) {
        throw new Error('Post-rollback health check failed');
      }
    }
    
    // 7. Update deployment history
    if (!dryRun) {
      await markRollbackComplete(targetDeployment);
    }
    
    log('✅ Rollback completed successfully!', 'green');
    log(`📍 Application rolled back to version ${targetDeployment.version}`, 'green');
    
    return { success: true, targetVersion: targetDeployment.version };
    
  } catch (error) {
    log(`❌ Rollback failed: ${error.message}`, 'red');
    
    // Attempt emergency recovery
    if (!dryRun) {
      log('🚨 Attempting emergency recovery...', 'yellow');
      await attemptEmergencyRecovery();
    }
    
    throw error;
  }
}

/**
 * Perform health check
 */
async function performHealthCheck() {
  try {
    const response = await fetch(ROLLBACK_CONFIG.healthCheckUrl, {
      timeout: ROLLBACK_CONFIG.healthCheckTimeout,
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'healthy' || data.status === 'degraded';
    }
    
    return false;
  } catch (error) {
    log(`Health check failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Create backup of current state
 */
async function createCurrentStateBackup() {
  const timestamp = Date.now();
  
  try {
    // Backup application files
    const appBackupPath = path.join(ROLLBACK_CONFIG.backupPath, `emergency-app-${timestamp}.tar.gz`);
    execSync(`tar -czf ${appBackupPath} dist/ server/ client/ --exclude=node_modules`, {
      stdio: 'inherit',
    });
    
    // Backup database
    const dbBackupPath = path.join(ROLLBACK_CONFIG.backupPath, `emergency-db-${timestamp}.sql`);
    if (process.env.DATABASE_URL) {
      execSync(`pg_dump ${process.env.DATABASE_URL} > ${dbBackupPath}`, {
        stdio: 'inherit',
      });
    }
    
    log(`💾 Emergency backup created: ${appBackupPath}`, 'green');
    
  } catch (error) {
    log(`⚠️  Failed to create emergency backup: ${error.message}`, 'yellow');
  }
}

/**
 * Rollback application code
 */
async function rollbackApplicationCode(targetDeployment) {
  const { rollbackInfo } = targetDeployment;
  
  if (await fileExists(rollbackInfo.applicationBackup)) {
    // Restore from backup
    execSync(`tar -xzf ${rollbackInfo.applicationBackup} -C /`, {
      stdio: 'inherit',
    });
    
    log(`📦 Application restored from ${rollbackInfo.applicationBackup}`, 'green');
  } else {
    // Fallback to git checkout
    log('⚠️  Backup not found, falling back to git checkout...', 'yellow');
    execSync(`git checkout ${targetDeployment.metadata.commitHash}`, {
      stdio: 'inherit',
    });
    
    // Rebuild application
    execSync('npm ci && npm run build', {
      stdio: 'inherit',
    });
  }
}

/**
 * Rollback database
 */
async function rollbackDatabase(targetDeployment) {
  const { rollbackInfo } = targetDeployment;
  
  if (await fileExists(rollbackInfo.databaseBackup)) {
    // Restore from database backup
    if (process.env.DATABASE_URL) {
      execSync(`psql ${process.env.DATABASE_URL} < ${rollbackInfo.databaseBackup}`, {
        stdio: 'inherit',
      });
      
      log(`🗄️  Database restored from ${rollbackInfo.databaseBackup}`, 'green');
    }
  } else {
    log('⚠️  Database backup not found, skipping database rollback...', 'yellow');
  }
}

/**
 * Restart services
 */
async function restartServices() {
  try {
    // This would depend on your deployment environment
    // Examples for different platforms:
    
    if (process.env.PM2_PROCESS_NAME) {
      // PM2
      execSync(`pm2 restart ${process.env.PM2_PROCESS_NAME}`, { stdio: 'inherit' });
    } else if (process.env.SYSTEMD_SERVICE_NAME) {
      // Systemd
      execSync(`sudo systemctl restart ${process.env.SYSTEMD_SERVICE_NAME}`, { stdio: 'inherit' });
    } else if (process.env.DOCKER_CONTAINER_NAME) {
      // Docker
      execSync(`docker restart ${process.env.DOCKER_CONTAINER_NAME}`, { stdio: 'inherit' });
    } else {
      log('⚠️  No service restart method configured', 'yellow');
    }
    
    // Wait for services to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    log(`⚠️  Service restart failed: ${error.message}`, 'yellow');
  }
}

/**
 * Mark rollback as complete
 */
async function markRollbackComplete(targetDeployment) {
  const history = await loadDeploymentHistory();
  
  // Mark current deployment as rolled back
  if (history.deployments[0]) {
    history.deployments[0].status = 'rolled_back';
    history.deployments[0].rolledBackAt = new Date().toISOString();
  }
  
  // Mark target deployment as current
  const targetIndex = history.deployments.findIndex(d => d.id === targetDeployment.id);
  if (targetIndex > 0) {
    const [target] = history.deployments.splice(targetIndex, 1);
    target.status = 'deployed';
    target.rolledBackTo = true;
    history.deployments.unshift(target);
  }
  
  await saveDeploymentHistory(history);
}

/**
 * Attempt emergency recovery
 */
async function attemptEmergencyRecovery() {
  try {
    log('🚨 Attempting to restart services...', 'yellow');
    await restartServices();
    
    const isHealthy = await performHealthCheck();
    if (isHealthy) {
      log('✅ Emergency recovery successful', 'green');
    } else {
      log('❌ Emergency recovery failed', 'red');
    }
  } catch (error) {
    log(`❌ Emergency recovery failed: ${error.message}`, 'red');
  }
}

/**
 * Utility functions
 */
function generateDeploymentId() {
  return `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function getGitCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

async function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupBackups(rollbackInfo) {
  try {
    const files = [
      rollbackInfo.applicationBackup,
      rollbackInfo.databaseBackup,
      rollbackInfo.configBackup,
    ];
    
    for (const file of files) {
      if (await fileExists(file)) {
        await fs.unlink(file);
      }
    }
  } catch (error) {
    log(`⚠️  Failed to cleanup old backups: ${error.message}`, 'yellow');
  }
}

/**
 * CLI interface
 */
async function main() {
  const command = process.argv[2];
  const environment = process.env.NODE_ENV || 'development';
  
  try {
    switch (command) {
      case 'list':
        const targets = await getRollbackTargets(environment);
        log(`📋 Available rollback targets for ${environment}:`, 'cyan');
        targets.forEach((target, index) => {
          log(`${index + 1}. Version ${target.version} (${target.timestamp})`, 'blue');
        });
        break;
        
      case 'rollback':
        const versionArg = process.argv[3];
        if (!versionArg) {
          log('❌ Please specify a version to rollback to', 'red');
          process.exit(1);
        }
        
        const allTargets = await getRollbackTargets(environment);
        const target = allTargets.find(t => t.version === versionArg || t.id === versionArg);
        
        if (!target) {
          log(`❌ Version ${versionArg} not found`, 'red');
          process.exit(1);
        }
        
        const options = {
          dryRun: process.argv.includes('--dry-run'),
          skipHealthCheck: process.argv.includes('--skip-health-check'),
          skipDatabaseRollback: process.argv.includes('--skip-db-rollback'),
        };
        
        await performRollback(target, options);
        break;
        
      case 'record':
        const version = process.argv[3] || 'unknown';
        await recordDeployment(version, environment);
        log(`✅ Deployment ${version} recorded`, 'green');
        break;
        
      default:
        log('Usage:', 'cyan');
        log('  node rollback.js list                    # List available rollback targets', 'blue');
        log('  node rollback.js rollback <version>      # Rollback to specific version', 'blue');
        log('  node rollback.js record <version>        # Record new deployment', 'blue');
        log('', 'reset');
        log('Options:', 'cyan');
        log('  --dry-run                # Show what would be done without making changes', 'blue');
        log('  --skip-health-check      # Skip health checks', 'blue');
        log('  --skip-db-rollback       # Skip database rollback', 'blue');
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
  recordDeployment,
  performRollback,
  getRollbackTargets,
  loadDeploymentHistory,
};
