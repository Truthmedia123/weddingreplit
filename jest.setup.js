// Jest setup file
import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/wedding_test';

// Mock fetch for Node.js
global.fetch = jest.fn();

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to suppress console logs in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});