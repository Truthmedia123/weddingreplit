/**
 * 🔒 SSL/TLS Configuration Middleware
 * 
 * This module provides comprehensive SSL/TLS configuration for production environments
 * including HTTPS enforcement, HSTS headers, and security best practices.
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';

// SSL/TLS Configuration
interface SSLConfig {
  enabled: boolean;
  enforceHTTPS: boolean;
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  certificate: {
    cert?: string;
    key?: string;
    ca?: string;
    passphrase?: string;
  };
  protocols: string[];
  ciphers: string[];
}

const DEFAULT_SSL_CONFIG: SSLConfig = {
  enabled: process.env.NODE_ENV === 'production',
  enforceHTTPS: process.env.NODE_ENV === 'production',
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  certificate: {
    cert: process.env.SSL_CERT_PATH || '',
    key: process.env.SSL_KEY_PATH || '',
    ca: process.env.SSL_CA_PATH || '',
    passphrase: process.env.SSL_PASSPHRASE || '',
  },
  protocols: ['TLSv1.2', 'TLSv1.3'],
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES256-SHA',
    'ECDHE-RSA-AES128-SHA',
  ],
};

/**
 * HTTPS redirect middleware
 */
export function httpsRedirect(options: { 
  enabled?: boolean;
  permanentRedirect?: boolean;
  excludePaths?: string[];
} = {}) {
  const {
    enabled = DEFAULT_SSL_CONFIG.enforceHTTPS,
    permanentRedirect = true,
    excludePaths = ['/health', '/.well-known/'],
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if HTTPS enforcement is disabled
    if (!enabled) {
      return next();
    }

    // Skip for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Check if request is already HTTPS
    const isHTTPS = req.secure || 
                   req.get('X-Forwarded-Proto') === 'https' ||
                   req.get('X-Forwarded-Ssl') === 'on' ||
                   (req.connection as any).encrypted;

    if (!isHTTPS) {
      const redirectUrl = `https://${req.get('Host')}${req.originalUrl}`;
      const statusCode = permanentRedirect ? 301 : 302;
      
      res.redirect(statusCode, redirectUrl);
      return;
    }

    next();
  };
}

/**
 * HSTS (HTTP Strict Transport Security) middleware
 */
export function hstsMiddleware(options: Partial<SSLConfig['hsts']> = {}) {
  const hstsConfig = { ...DEFAULT_SSL_CONFIG.hsts, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!hstsConfig.enabled) {
      return next();
    }

    let hstsValue = `max-age=${hstsConfig.maxAge}`;
    
    if (hstsConfig.includeSubDomains) {
      hstsValue += '; includeSubDomains';
    }
    
    if (hstsConfig.preload) {
      hstsValue += '; preload';
    }

    res.set('Strict-Transport-Security', hstsValue);
    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Prevent MIME type sniffing
    res.set('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.set('X-Frame-Options', 'DENY');
    
    // XSS protection
    res.set('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.set('Permissions-Policy', [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
    ].join(', '));

    next();
  };
}

/**
 * Load SSL certificates
 */
export function loadSSLCertificates(config: SSLConfig['certificate']): https.ServerOptions | null {
  try {
    const sslOptions: https.ServerOptions = {};

    if (config.cert && config.key) {
      // Load certificate and key files
      if (fs.existsSync(config.cert) && fs.existsSync(config.key)) {
        sslOptions.cert = fs.readFileSync(config.cert);
        sslOptions.key = fs.readFileSync(config.key);
        
        // Load CA certificate if provided
        if (config.ca && fs.existsSync(config.ca)) {
          sslOptions.ca = fs.readFileSync(config.ca);
        }
        
        // Set passphrase if provided
        if (config.passphrase) {
          sslOptions.passphrase = config.passphrase;
        }
        
        // Configure SSL/TLS protocols and ciphers
        sslOptions.secureProtocol = 'TLSv1_2_method';
        sslOptions.ciphers = DEFAULT_SSL_CONFIG.ciphers.join(':');
        sslOptions.honorCipherOrder = true;
        
        console.log('✅ SSL certificates loaded successfully');
        return sslOptions;
      } else {
        console.warn('⚠️  SSL certificate files not found');
      }
    } else {
      console.log('ℹ️  SSL certificate paths not configured');
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to load SSL certificates:', error);
    return null;
  }
}

/**
 * Create HTTPS server
 */
export function createHTTPSServer(app: any, sslOptions: https.ServerOptions) {
  const server = https.createServer(sslOptions, app);
  
  // Configure server options
  server.timeout = 30000; // 30 seconds
  server.keepAliveTimeout = 5000; // 5 seconds
  server.headersTimeout = 6000; // 6 seconds
  
  return server;
}

/**
 * SSL certificate auto-renewal (Let's Encrypt)
 */
export class SSLCertificateManager {
  private certificatePath: string;
  private renewalCheckInterval: NodeJS.Timeout | null = null;

  constructor(certificatePath: string) {
    this.certificatePath = certificatePath;
  }

  /**
   * Check if certificate needs renewal
   */
  async checkCertificateExpiry(): Promise<{ 
    needsRenewal: boolean; 
    daysUntilExpiry: number;
    expiryDate: Date;
  }> {
    try {
      const certPath = path.join(this.certificatePath, 'cert.pem');
      
      if (!fs.existsSync(certPath)) {
        return {
          needsRenewal: true,
          daysUntilExpiry: 0,
          expiryDate: new Date(),
        };
      }

      const certData = fs.readFileSync(certPath, 'utf8');
      const cert = require('crypto').createPublicKey(certData);
      
      // Extract expiry date from certificate
      // This is a simplified version - in production, use a proper certificate parser
      const expiryDate = new Date(); // Placeholder
      const now = new Date();
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        needsRenewal: daysUntilExpiry <= 30, // Renew if expires within 30 days
        daysUntilExpiry,
        expiryDate,
      };
    } catch (error) {
      console.error('Error checking certificate expiry:', error);
      return {
        needsRenewal: true,
        daysUntilExpiry: 0,
        expiryDate: new Date(),
      };
    }
  }

  /**
   * Renew SSL certificate using Certbot
   */
  async renewCertificate(): Promise<boolean> {
    try {
      console.log('🔄 Starting SSL certificate renewal...');
      
      const { execSync } = require('child_process');
      
      // Run certbot renewal
      execSync('certbot renew --quiet --no-self-upgrade', {
        stdio: 'inherit',
        timeout: 120000, // 2 minutes
      });
      
      console.log('✅ SSL certificate renewed successfully');
      
      // Restart server to load new certificate
      await this.reloadSSLCertificate();
      
      return true;
    } catch (error) {
      console.error('❌ SSL certificate renewal failed:', error);
      return false;
    }
  }

  /**
   * Reload SSL certificate without restarting server
   */
  async reloadSSLCertificate(): Promise<void> {
    try {
      // This would typically involve gracefully reloading the HTTPS server
      console.log('🔄 Reloading SSL certificate...');
      
      // Send SIGUSR2 signal to reload certificates (if using PM2)
      if (process.env.PM2_PROCESS_NAME) {
        const { execSync } = require('child_process');
        execSync(`pm2 reload ${process.env.PM2_PROCESS_NAME}`);
      }
      
      console.log('✅ SSL certificate reloaded');
    } catch (error) {
      console.error('❌ Failed to reload SSL certificate:', error);
    }
  }

  /**
   * Start automatic certificate renewal checking
   */
  startAutoRenewal(checkIntervalHours: number = 24): void {
    const checkInterval = checkIntervalHours * 60 * 60 * 1000; // Convert to milliseconds
    
    this.renewalCheckInterval = setInterval(async () => {
      try {
        const { needsRenewal, daysUntilExpiry } = await this.checkCertificateExpiry();
        
        if (needsRenewal) {
          console.log(`⚠️  SSL certificate expires in ${daysUntilExpiry} days, attempting renewal...`);
          await this.renewCertificate();
        } else {
          console.log(`✅ SSL certificate is valid for ${daysUntilExpiry} more days`);
        }
      } catch (error) {
        console.error('Error during automatic certificate renewal check:', error);
      }
    }, checkInterval);
    
    console.log(`🔄 Started automatic SSL certificate renewal checking (every ${checkIntervalHours} hours)`);
  }

  /**
   * Stop automatic certificate renewal checking
   */
  stopAutoRenewal(): void {
    if (this.renewalCheckInterval) {
      clearInterval(this.renewalCheckInterval);
      this.renewalCheckInterval = null;
      console.log('🛑 Stopped automatic SSL certificate renewal checking');
    }
  }
}

/**
 * Complete SSL middleware setup
 */
export function setupSSLMiddleware(app: any, config: Partial<SSLConfig> = {}) {
  const sslConfig = { ...DEFAULT_SSL_CONFIG, ...config };
  
  if (sslConfig.enabled) {
    // Add HTTPS redirect
    app.use(httpsRedirect({ 
      enabled: sslConfig.enforceHTTPS,
    }));
    
    // Add HSTS headers
    app.use(hstsMiddleware(sslConfig.hsts));
    
    // Add security headers
    app.use(securityHeaders());
    
    console.log('✅ SSL/TLS middleware configured');
  } else {
    console.log('ℹ️  SSL/TLS middleware disabled (development mode)');
  }
}

export default {
  httpsRedirect,
  hstsMiddleware,
  securityHeaders,
  loadSSLCertificates,
  createHTTPSServer,
  setupSSLMiddleware,
  SSLCertificateManager,
};
