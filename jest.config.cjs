/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  
  // Multiple test environments for different test types
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      roots: ['<rootDir>/server'],
      testMatch: ['<rootDir>/server/**/__tests__/**/*.+(ts|js)', '<rootDir>/server/**/*.(test|spec).+(ts|js)'],
      transform: {
        '^.+\\.(ts|js)$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@server/(.*)$': '<rootDir>/server/$1',
      },
    },
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/client'],
      testMatch: ['<rootDir>/client/**/__tests__/**/*.+(ts|tsx|js)', '<rootDir>/client/**/*.(test|spec).+(ts|tsx|js)'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
      },
      setupFilesAfterEnv: ['<rootDir>/client/__tests__/setup.ts'],
    },
    {
      displayName: 'shared',
      testEnvironment: 'node',
      roots: ['<rootDir>/shared'],
      testMatch: ['<rootDir>/shared/**/__tests__/**/*.+(ts|js)', '<rootDir>/shared/**/*.(test|spec).+(ts|js)'],
      transform: {
        '^.+\\.(ts|js)$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
      },
    }
  ],
  
  // Global coverage settings
  collectCoverageFrom: [
    'server/**/*.{ts,js}',
    'client/src/**/*.{ts,tsx}',
    'shared/**/*.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/__tests__/**',
    '!**/coverage/**',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Test timeout for integration tests
  testTimeout: 30000,
  
  // Global test environment options
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  
  // Snapshot serializers
  snapshotSerializers: ['jest-serializer-html'],
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output for better debugging
  verbose: true,
};