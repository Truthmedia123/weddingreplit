/**
 * 🔒 Environment-Specific Security Configuration
 * 
 * This module provides security configurations for different environments:
 * - Development: Minimal protection for debugging
 * - Staging: Moderate protection for testing
 * - Production: Maximum protection for live deployment
 */

export interface SecurityConfig {
  // Code protection settings
  enableCodeObfuscation: boolean;
  enableSourceMapRemoval: boolean;
  enableConsoleRemoval: boolean;
  
  // UI protection settings
  enableRightClickProtection: boolean;
  enableDevToolsDetection: boolean;
  enableContextMenuDisable: boolean;
  enableKeyboardShortcutsDisable: boolean;
  
  // Content protection settings
  enableWatermarking: boolean;
  enableTextSelectionDisable: boolean;
  enableCopyProtection: boolean;
  enablePrintProtection: boolean;
  
  // API protection settings
  enableApiKeyValidation: boolean;
  enableOriginValidation: boolean;
  enableRateLimiting: boolean;
  enableRequestLogging: boolean;
  
  // Advanced protection settings
  enableFingerprinting: boolean;
  enableTamperDetection: boolean;
  enableSessionValidation: boolean;
  enableEncryption: boolean;
}

// Development environment (minimal protection)
export const developmentSecurity: SecurityConfig = {
  // Code protection - minimal for debugging
  enableCodeObfuscation: false,
  enableSourceMapRemoval: false,
  enableConsoleRemoval: false,
  
  // UI protection - minimal for development
  enableRightClickProtection: false,
  enableDevToolsDetection: false,
  enableContextMenuDisable: false,
  enableKeyboardShortcutsDisable: false,
  
  // Content protection - minimal
  enableWatermarking: false,
  enableTextSelectionDisable: false,
  enableCopyProtection: false,
  enablePrintProtection: false,
  
  // API protection - basic
  enableApiKeyValidation: false,
  enableOriginValidation: false,
  enableRateLimiting: true,
  enableRequestLogging: true,
  
  // Advanced protection - disabled
  enableFingerprinting: false,
  enableTamperDetection: false,
  enableSessionValidation: false,
  enableEncryption: false,
};

// Staging environment (moderate protection)
export const stagingSecurity: SecurityConfig = {
  // Code protection - moderate
  enableCodeObfuscation: true,
  enableSourceMapRemoval: true,
  enableConsoleRemoval: true,
  
  // UI protection - moderate
  enableRightClickProtection: true,
  enableDevToolsDetection: true,
  enableContextMenuDisable: true,
  enableKeyboardShortcutsDisable: true,
  
  // Content protection - moderate
  enableWatermarking: true,
  enableTextSelectionDisable: false,
  enableCopyProtection: false,
  enablePrintProtection: true,
  
  // API protection - moderate
  enableApiKeyValidation: true,
  enableOriginValidation: true,
  enableRateLimiting: true,
  enableRequestLogging: true,
  
  // Advanced protection - moderate
  enableFingerprinting: true,
  enableTamperDetection: false,
  enableSessionValidation: true,
  enableEncryption: false,
};

// Production environment (maximum protection)
export const productionSecurity: SecurityConfig = {
  // Code protection - maximum
  enableCodeObfuscation: true,
  enableSourceMapRemoval: true,
  enableConsoleRemoval: true,
  
  // UI protection - maximum
  enableRightClickProtection: true,
  enableDevToolsDetection: true,
  enableContextMenuDisable: true,
  enableKeyboardShortcutsDisable: true,
  
  // Content protection - maximum
  enableWatermarking: true,
  enableTextSelectionDisable: true,
  enableCopyProtection: true,
  enablePrintProtection: true,
  
  // API protection - maximum
  enableApiKeyValidation: true,
  enableOriginValidation: true,
  enableRateLimiting: true,
  enableRequestLogging: true,
  
  // Advanced protection - maximum
  enableFingerprinting: true,
  enableTamperDetection: true,
  enableSessionValidation: true,
  enableEncryption: true,
};

// Get security configuration based on environment
export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionSecurity;
    case 'staging':
      return stagingSecurity;
    case 'development':
    default:
      return developmentSecurity;
  }
}

// Security level enum
export enum SecurityLevel {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  MAXIMUM = 'maximum'
}

// Get security level based on configuration
export function getSecurityLevel(config: SecurityConfig): SecurityLevel {
  const protectionCount = Object.values(config).filter(Boolean).length;
  const totalCount = Object.keys(config).length;
  const percentage = (protectionCount / totalCount) * 100;
  
  if (percentage >= 80) return SecurityLevel.MAXIMUM;
  if (percentage >= 50) return SecurityLevel.MODERATE;
  return SecurityLevel.MINIMAL;
}

// Security validation utilities
export const securityUtils = {
  // Validate API key
  validateApiKey: (apiKey: string | undefined): boolean => {
    const config = getSecurityConfig();
    if (!config.enableApiKeyValidation) return true;
    
    const validApiKey = process.env.API_KEY;
    return apiKey === validApiKey;
  },
  
  // Validate request origin
  validateOrigin: (origin: string | undefined): boolean => {
    const config = getSecurityConfig();
    if (!config.enableOriginValidation) return true;
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.DOMAIN_URL,
      'https://thegoanwedding.com',
      'https://www.thegoanwedding.com'
    ].filter(Boolean);
    
    return !origin || allowedOrigins.includes(origin);
  },
  
  // Generate security fingerprint
  generateFingerprint: (): string => {
    const config = getSecurityConfig();
    if (!config.enableFingerprinting) return '';
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(fingerprint));
  },
  
  // Check for tampering
  detectTampering: (): boolean => {
    const config = getSecurityConfig();
    if (!config.enableTamperDetection) return false;
    
    // Check for common tampering indicators
    const indicators = [
      typeof window.console.log !== 'function',
      typeof window.alert !== 'function',
      window.outerHeight - window.innerHeight > 200,
      window.outerWidth - window.innerWidth > 200
    ];
    
    return indicators.some(Boolean);
  }
};

// Security middleware configuration
export const securityMiddleware = {
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://thegoanwedding.com', 'https://www.thegoanwedding.com']
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  },
  
  // Helmet configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }
};

// Export default configuration
export default {
  getSecurityConfig,
  getSecurityLevel,
  securityUtils,
  securityMiddleware,
  developmentSecurity,
  stagingSecurity,
  productionSecurity,
  SecurityLevel
};
