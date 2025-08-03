# Testing Guide

## Overview

This project uses a comprehensive testing strategy with Jest and React Testing Library to ensure code quality and prevent regressions. The testing infrastructure supports unit tests, integration tests, snapshot tests, and performance tests.

## Test Structure

```
├── client/__tests__/           # Frontend tests
│   ├── components/            # React component tests
│   ├── pages/                # Page component tests
│   ├── utils/                # Client-side utility tests
│   ├── __snapshots__/        # UI snapshot files
│   ├── setup.ts              # Test environment setup
│   └── utils/test-utils.tsx  # Client testing utilities
├── server/__tests__/          # Backend tests
│   ├── utils/test-utils.ts   # Server testing utilities
│   └── *.test.ts             # API and logic tests
└── shared/__tests__/          # Shared code tests
    ├── test-utils.ts         # Common testing utilities
    └── *.test.ts             # Schema and utility tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Client tests only
npm test -- --selectProjects client

# Server tests only
npm test -- --selectProjects server

# Shared tests only
npm test -- --selectProjects shared
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Categories

### 1. Unit Tests
- **Purpose**: Test individual functions and components in isolation
- **Location**: Throughout all test directories
- **Naming**: `*.test.ts` or `*.test.tsx`

### 2. Integration Tests
- **Purpose**: Test interactions between multiple components or API endpoints
- **Location**: `server/__tests__/` for API tests, `client/__tests__/pages/` for page tests
- **Examples**: API endpoint tests, multi-component workflows

### 3. Snapshot Tests
- **Purpose**: Detect unintended UI changes
- **Location**: `client/__tests__/components/`
- **Files**: Snapshots stored in `__snapshots__/` directories

### 4. Performance Tests
- **Purpose**: Validate response times and resource usage
- **Location**: `server/__tests__/performance.test.ts`
- **Thresholds**: Configurable in Jest config

## Writing Tests

### Client Component Tests

```typescript
import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import { MyComponent } from '../../src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockHandler = jest.fn();
    render(<MyComponent onAction={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });

  it('matches snapshot', () => {
    const { container } = render(<MyComponent />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### Server API Tests

```typescript
import request from 'supertest';
import { app } from '../index';
import { TestDatabase } from './utils/test-utils';

describe('API Endpoint', () => {
  beforeEach(async () => {
    await TestDatabase.reset();
  });

  it('should return data', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

## Test Utilities

### Client Test Utils
- `render()`: Renders components with providers
- `createMockVendor()`: Creates mock vendor data
- `waitForLoadingToFinish()`: Waits for async operations

### Server Test Utils
- `TestDatabase`: Database seeding and cleanup
- `createTestVendor()`: Creates test vendor data
- `measureExecutionTime()`: Performance measurement

### Shared Test Utils
- `mockDate()`: Mock date/time for consistent tests
- `expectValidationError()`: Validation testing helpers
- `generateMockData`: Realistic test data generators

## Best Practices

### 1. Test Naming
- Use descriptive test names: `should return 404 when vendor not found`
- Group related tests with `describe` blocks
- Use consistent naming patterns

### 2. Test Data
- Use factory functions for consistent test data
- Avoid hardcoded values that might change
- Clean up test data after each test

### 3. Mocking
- Mock external dependencies (APIs, databases)
- Use Jest mocks for consistent behavior
- Clear mocks between tests

### 4. Assertions
- Use specific assertions: `toHaveLength(3)` vs `toBeTruthy()`
- Test both positive and negative cases
- Include edge cases and error conditions

### 5. Performance
- Keep tests fast and focused
- Use `beforeEach`/`afterEach` for setup/cleanup
- Avoid unnecessary async operations

## Coverage Requirements

- **Minimum Coverage**: 80% for all metrics
- **Critical Paths**: 95% coverage required
- **Files Excluded**: Test files, type definitions, build artifacts

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled nightly runs

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No flaky tests (>2% failure rate)

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` or `findBy` queries
2. **DOM Cleanup**: Ensure proper test isolation
3. **Mock Issues**: Clear mocks between tests
4. **Snapshot Failures**: Review changes and update if intentional

### Debug Commands
```bash
# Run specific test file
npm test -- VendorCard.test.tsx

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
```

## Performance Testing

### Response Time Thresholds
- API endpoints: < 200ms
- Page loads: < 2000ms
- Database queries: < 100ms

### Load Testing
- Concurrent users: 50-100
- Test duration: 5 minutes
- Success rate: > 99%

## Maintenance

### Regular Tasks
- Review and update test data
- Monitor test execution times
- Update snapshots for intentional UI changes
- Analyze coverage reports for gaps

### When to Update Tests
- New features added
- Bug fixes implemented
- UI components modified
- API endpoints changed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)