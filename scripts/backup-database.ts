import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface BackupOptions {
  outputDir?: string;
  compress?: boolean;
  retention?: number; // days
}

class DatabaseBackup {
  private databaseUrl: string;
  private outputDir: string;
  private retention: number;

  constructor(options: BackupOptions = {}) {
    this.databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    this.outputDir = options.outputDir || path.join(process.cwd(), 'backups');
    this.retention = options.retention || 7; // 7 days default

    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
    }
  }

  // Ensure backup directory exists
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  // Generate backup filename
  private generateBackupFilename(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `wedding-backup-${timestamp}.sql`;
  }

  // Create database backup
  async createBackup(compress: boolean = true): Promise<string> {
    await this.ensureBackupDir();

    const filename = this.generateBackupFilename();
    const backupPath = path.join(this.outputDir, filename);
    
    console.log(`Creating database backup: ${filename}`);

    try {
      // Use pg_dump to create backup
      const command = `pg_dump "${this.databaseUrl}" --no-password --verbose --clean --no-acl --no-owner`;
      
      if (compress) {
        // Compress with gzip
        const compressedPath = `${backupPath}.gz`;
        await execAsync(`${command} | gzip > "${compressedPath}"`);
        console.log(`✅ Backup created successfully: ${compressedPath}`);
        return compressedPath;
      } else {
        await execAsync(`${command} > "${backupPath}"`);
        console.log(`✅ Backup created successfully: ${backupPath}`);
        return backupPath;
      }
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  // Restore from backup
  async restoreBackup(backupPath: string): Promise<void> {
    console.log(`Restoring database from: ${backupPath}`);

    try {
      let command: string;

      if (backupPath.endsWith('.gz')) {
        // Decompress and restore
        command = `gunzip -c "${backupPath}" | psql "${this.databaseUrl}"`;
      } else {
        command = `psql "${this.databaseUrl}" < "${backupPath}"`;
      }

      await execAsync(command);
      console.log('✅ Database restored successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  // Clean up old backups
  async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.outputDir);
      const backupFiles = files.filter(file => 
        file.startsWith('wedding-backup-') && 
        (file.endsWith('.sql') || file.endsWith('.sql.gz'))
      );

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retention);

      for (const file of backupFiles) {
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  // List available backups
  async listBackups(): Promise<Array<{ filename: string; size: number; created: Date }>> {
    try {
      const files = await fs.readdir(this.outputDir);
      const backupFiles = files.filter(file => 
        file.startsWith('wedding-backup-') && 
        (file.endsWith('.sql') || file.endsWith('.sql.gz'))
      );

      const backups = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          
          return {
            filename: file,
            size: stats.size,
            created: stats.mtime,
          };
        })
      );

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  // Verify backup integrity
  async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      console.log(`Verifying backup: ${backupPath}`);

      let command: string;
      if (backupPath.endsWith('.gz')) {
        command = `gunzip -t "${backupPath}"`;
      } else {
        // Check if file is valid SQL
        command = `head -n 10 "${backupPath}" | grep -q "PostgreSQL database dump"`;
      }

      await execAsync(command);
      console.log('✅ Backup verification passed');
      return true;
    } catch (error) {
      console.error('❌ Backup verification failed:', error);
      return false;
    }
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  const backup = new DatabaseBackup({
    retention: 7, // Keep backups for 7 days
  });

  try {
    switch (command) {
      case 'create':
        const compress = !args.includes('--no-compress');
        await backup.createBackup(compress);
        await backup.cleanupOldBackups();
        break;

      case 'restore':
        const backupPath = args[1];
        if (!backupPath) {
          console.error('Please provide backup file path');
          process.exit(1);
        }
        await backup.restoreBackup(backupPath);
        break;

      case 'list':
        const backups = await backup.listBackups();
        console.log('\nAvailable backups:');
        backups.forEach(b => {
          const sizeKB = Math.round(b.size / 1024);
          console.log(`  ${b.filename} (${sizeKB}KB) - ${b.created.toISOString()}`);
        });
        break;

      case 'cleanup':
        await backup.cleanupOldBackups();
        break;

      case 'verify':
        const verifyPath = args[1];
        if (!verifyPath) {
          console.error('Please provide backup file path');
          process.exit(1);
        }
        const isValid = await backup.verifyBackup(verifyPath);
        process.exit(isValid ? 0 : 1);
        break;

      default:
        console.log(`
Usage: npm run backup <command>

Commands:
  create [--no-compress]  Create a new backup
  restore <file>          Restore from backup file
  list                    List available backups
  cleanup                 Remove old backups
  verify <file>           Verify backup integrity

Examples:
  npm run backup create
  npm run backup restore backups/wedding-backup-2024-01-01.sql.gz
  npm run backup list
        `);
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DatabaseBackup };