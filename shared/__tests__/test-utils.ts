// Shared test utilities for both client and server

// Date/time mocking utilities
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  return mockDate;
};

export const restoreDate = () => {
  (global.Date as any).mockRestore();
};

// Common validation test helpers
export const expectValidationError = (result: any, field: string, message?: string) => {
  expect(result.success).toBe(false);
  if (message) {
    expect(result.error.issues.some((issue: any) => 
      issue.path.includes(field) && issue.message.includes(message)
    )).toBe(true);
  } else {
    expect(result.error.issues.some((issue: any) => 
      issue.path.includes(field)
    )).toBe(true);
  }
};

export const expectValidationSuccess = (result: any) => {
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
};

// Schema test data generators
export const generateValidEmail = () => `test${Date.now()}@example.com`;
export const generateValidPhone = () => `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`;
export const generateValidSlug = () => `test-slug-${Date.now()}`;

// Common test patterns
export const testRequiredField = (validData: any, field: string, validationFn: (data: any) => any) => {
  const invalidData = { ...validData };
  delete invalidData[field];
  
  const result = validationFn(invalidData);
  expectValidationError(result, field);
};

export const testFieldLength = (
  validData: any, 
  field: string, 
  minLength: number, 
  maxLength: number, 
  validationFn: (data: any) => any
) => {
  // Test minimum length
  if (minLength > 0) {
    const tooShortData = { 
      ...validData, 
      [field]: 'a'.repeat(minLength - 1) 
    };
    const shortResult = validationFn(tooShortData);
    expectValidationError(shortResult, field);
  }

  // Test maximum length
  const tooLongData = { 
    ...validData, 
    [field]: 'a'.repeat(maxLength + 1) 
  };
  const longResult = validationFn(tooLongData);
  expectValidationError(longResult, field);

  // Test valid length
  const validLengthData = { 
    ...validData, 
    [field]: 'a'.repeat(Math.floor((minLength + maxLength) / 2)) 
  };
  const validResult = validationFn(validLengthData);
  expectValidationSuccess(validResult);
};

// Performance testing utilities
export const createPerformanceTest = (name: string, threshold: number) => {
  return async (testFunction: () => Promise<any>) => {
    const start = performance.now();
    await testFunction();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(threshold);
    console.log(`Performance test "${name}": ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
  };
};

// Mock data generators with realistic patterns
export const generateMockData = {
  indianName: () => {
    const firstNames = ['Priya', 'Rahul', 'Anita', 'Vikram', 'Sunita', 'Arjun', 'Kavya', 'Rohan'];
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Shah'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  },
  
  indianCity: () => {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    return cities[Math.floor(Math.random() * cities.length)];
  },
  
  weddingVenue: () => {
    const venues = ['Grand Palace Hotel', 'Royal Garden Resort', 'Heritage Banquet Hall', 'Luxury Beach Resort', 'Traditional Haveli'];
    return venues[Math.floor(Math.random() * venues.length)];
  },
  
  vendorCategory: () => {
    const categories = ['Photography', 'Catering', 'Decoration', 'Music & DJ', 'Makeup Artist', 'Wedding Planner'];
    return categories[Math.floor(Math.random() * categories.length)];
  },
  
  priceRange: () => {
    const ranges = ['₹25,000 - ₹50,000', '₹50,000 - ₹1,00,000', '₹1,00,000 - ₹2,00,000', '₹2,00,000 - ₹5,00,000'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }
};

// Test environment helpers
export const isTestEnvironment = () => process.env.NODE_ENV === 'test';

export const skipInCI = (testFn: () => void) => {
  if (process.env.CI) {
    test.skip('Skipped in CI environment', testFn);
  } else {
    testFn();
  }
};

// Async test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryAsync = async <T>(
  fn: () => Promise<T>, 
  maxAttempts: number = 3, 
  delay: number = 100
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await waitFor(delay * attempt);
      }
    }
  }
  
  throw lastError!;
};

// Test to ensure utilities work correctly
describe('Test Utilities', () => {
  it('should generate valid mock data', () => {
    expect(generateMockData.indianName()).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
    expect(generateMockData.indianCity()).toBeTruthy();
    expect(generateMockData.vendorCategory()).toBeTruthy();
  });

  it('should validate test environment', () => {
    expect(isTestEnvironment()).toBe(true);
  });
});