/**
 * 🌍 Environment Configuration
 * 
 * This module provides environment-specific configurations for different deployment stages.
 */

export interface EnvironmentConfig {
  name: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  database: {
    ssl: boolean;
    poolSize: number;
    connectionTimeout: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
  security: {
    enableCORS: boolean;
    allowedOrigins: string[];
    enableCSP: boolean;
    enableHSTS: boolean;
  };
  monitoring: {
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enablePerformanceTracking: boolean;
  };
  cdn: {
    enabled: boolean;
    baseUrl?: string;
    images: boolean;
    assets: boolean;
  };
  compression: {
    enabled: boolean;
    level: number;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableConsole: boolean;
    enableFile: boolean;
  };
}

const baseConfig: Partial<EnvironmentConfig> = {
  api: {
    timeout: 10000,
    retries: 3,
  },
  database: {
    poolSize: 10,
    connectionTimeout: 5000,
  },
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 100,
  },
};

export const environments: Record<string, EnvironmentConfig> = {
  development: {
    ...baseConfig,
    name: 'development',
    isDevelopment: true,
    isProduction: false,
    isStaging: false,
    api: {
      ...baseConfig.api!,
      baseUrl: 'http://localhost:5002',
    },
    database: {
      ...baseConfig.database!,
      ssl: false,
      poolSize: 5,
    },
    security: {
      enableCORS: true,
      allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      enableCSP: false,
      enableHSTS: false,
    },
    monitoring: {
      enableAnalytics: false,
      enableErrorReporting: false,
      enablePerformanceTracking: true,
    },
    cdn: {
      enabled: false,
      images: false,
      assets: false,
    },
    compression: {
      enabled: false,
      level: 1,
    },
    logging: {
      level: 'debug',
      enableConsole: true,
      enableFile: false,
    },
  },

  staging: {
    ...baseConfig,
    name: 'staging',
    isDevelopment: false,
    isProduction: false,
    isStaging: true,
    api: {
      ...baseConfig.api!,
      baseUrl: 'https://staging-api.yourweddingapp.com',
    },
    database: {
      ...baseConfig.database!,
      ssl: true,
      poolSize: 15,
    },
    security: {
      enableCORS: true,
      allowedOrigins: [
        'https://staging.yourweddingapp.com',
        'https://preview.yourweddingapp.com',
      ],
      enableCSP: true,
      enableHSTS: true,
    },
    monitoring: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enablePerformanceTracking: true,
    },
    cdn: {
      enabled: true,
      baseUrl: 'https://cdn-staging.yourweddingapp.com',
      images: true,
      assets: true,
    },
    compression: {
      enabled: true,
      level: 6,
    },
    logging: {
      level: 'info',
      enableConsole: true,
      enableFile: true,
    },
  },

  production: {
    ...baseConfig,
    name: 'production',
    isDevelopment: false,
    isProduction: true,
    isStaging: false,
    api: {
      ...baseConfig.api!,
      baseUrl: 'https://api.yourweddingapp.com',
    },
    database: {
      ...baseConfig.database!,
      ssl: true,
      poolSize: 20,
    },
    security: {
      enableCORS: true,
      allowedOrigins: [
        'https://yourweddingapp.com',
        'https://www.yourweddingapp.com',
      ],
      enableCSP: true,
      enableHSTS: true,
    },
    monitoring: {
      enableAnalytics: true,
      enableErrorReporting: true,
      enablePerformanceTracking: true,
    },
    cdn: {
      enabled: true,
      baseUrl: 'https://cdn.yourweddingapp.com',
      images: true,
      assets: true,
    },
    compression: {
      enabled: true,
      level: 9,
    },
    logging: {
      level: 'error',
      enableConsole: false,
      enableFile: true,
    },
  },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV || 'development';
  const config = environments[env];
  
  if (!config) {
    throw new Error(`Unknown environment: ${env}`);
  }
  
  return config;
}

export default getEnvironmentConfig;
