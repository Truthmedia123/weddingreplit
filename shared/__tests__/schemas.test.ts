import { 
  expectValidationError, 
  expectValidationSuccess, 
  testRequiredField, 
  testFieldLength,
  generateValidEmail,
  generateValidPhone 
} from './test-utils';

// Mock validation functions (these would be imported from your actual schema files)
const validateVendor = (data: any) => {
  // This is a mock implementation - replace with actual schema validation
  const errors: any[] = [];
  
  if (!data.name) errors.push({ path: ['name'], message: 'Name is required' });
  if (!data.email) errors.push({ path: ['email'], message: 'Email is required' });
  if (data.email && !data.email.includes('@')) errors.push({ path: ['email'], message: 'Invalid email' });
  if (data.name && data.name.length > 100) errors.push({ path: ['name'], message: 'Name too long' });
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    error: errors.length > 0 ? { issues: errors } : undefined,
  };
};

const validateBlogPost = (data: any) => {
  const errors: any[] = [];
  
  if (!data.title) errors.push({ path: ['title'], message: 'Title is required' });
  if (!data.content) errors.push({ path: ['content'], message: 'Content is required' });
  if (data.title && data.title.length > 200) errors.push({ path: ['title'], message: 'Title too long' });
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    error: errors.length > 0 ? { issues: errors } : undefined,
  };
};

describe('Schema Validation Tests', () => {
  describe('Vendor Schema', () => {
    const validVendorData = {
      name: 'Test Vendor',
      email: generateValidEmail(),
      phone: generateValidPhone(),
      category: 'Photography',
      location: 'Mumbai',
      description: 'Test description',
      services: 'Test services',
    };

    it('should validate correct vendor data', () => {
      const result = validateVendor(validVendorData);
      expectValidationSuccess(result);
    });

    it('should require name field', () => {
      testRequiredField(validVendorData, 'name', validateVendor);
    });

    it('should require email field', () => {
      testRequiredField(validVendorData, 'email', validateVendor);
    });

    it('should validate email format', () => {
      const invalidEmailData = { ...validVendorData, email: 'invalid-email' };
      const result = validateVendor(invalidEmailData);
      expectValidationError(result, 'email');
    });

    it('should validate name length', () => {
      testFieldLength(validVendorData, 'name', 1, 100, validateVendor);
    });
  });

  describe('Blog Post Schema', () => {
    const validBlogData = {
      title: 'Test Blog Post',
      content: 'This is test content for the blog post',
      author: 'Test Author',
      published: true,
    };

    it('should validate correct blog post data', () => {
      const result = validateBlogPost(validBlogData);
      expectValidationSuccess(result);
    });

    it('should require title field', () => {
      testRequiredField(validBlogData, 'title', validateBlogPost);
    });

    it('should require content field', () => {
      testRequiredField(validBlogData, 'content', validateBlogPost);
    });

    it('should validate title length', () => {
      testFieldLength(validBlogData, 'title', 1, 200, validateBlogPost);
    });
  });
});