# Design Document

## Overview

This design outlines the systematic renaming of "ceremony time" to "nuptials time" across all layers of the wedding vendor hub application. The change affects frontend components, backend APIs, database schemas, and all user-facing text.

## Architecture

### Affected Layers

1. **Frontend Layer**
   - React components with form fields
   - State management (useState, form state)
   - TypeScript interfaces and types
   - User-facing text and labels

2. **Backend Layer**
   - API route handlers
   - Database models and schemas
   - Validation schemas (Zod)
   - Response formatting

3. **Database Layer**
   - Column names in tables
   - Migration scripts
   - Seed data

4. **Shared Layer**
   - TypeScript types
   - Validation schemas
   - Constants and enums

## Components and Interfaces

### Search Strategy

```typescript
// Search patterns to identify all instances
const searchPatterns = [
  // Text patterns
  /ceremony time/gi,
  /Ceremony Time/gi,
  /CEREMONY TIME/gi,
  
  // Variable patterns
  /ceremonyTime/g,
  /ceremony_time/g,
  /CeremonyTime/g,
  
  // Database patterns
  /ceremony_time/g,
  /"ceremony_time"/g,
  /'ceremony_time'/g,
  
  // Form field patterns
  /name="ceremonyTime"/g,
  /id="ceremonyTime"/g,
  /htmlFor="ceremonyTime"/g
];
```

### Replacement Mapping

```typescript
interface ReplacementMapping {
  // Text replacements
  'ceremony time': 'nuptials time';
  'Ceremony Time': 'Nuptials Time';
  'CEREMONY TIME': 'NUPTIALS TIME';
  
  // Variable replacements
  'ceremonyTime': 'nuptialsTime';
  'ceremony_time': 'nuptials_time';
  'CeremonyTime': 'NuptialsTime';
  
  // Form field replacements
  'name="ceremonyTime"': 'name="nuptialsTime"';
  'id="ceremonyTime"': 'id="nuptialsTime"';
  'htmlFor="ceremonyTime"': 'htmlFor="nuptialsTime"';
}
```

### File Categories to Update

1. **React Components**
   - Form components (CreateRSVP, InvitationGenerator)
   - Display components (wedding details, invitations)
   - Layout components with wedding information

2. **TypeScript Definitions**
   - Interface definitions in shared/schema.ts
   - Type definitions for wedding data
   - API response types

3. **Backend Files**
   - Route handlers in server/routes.ts
   - Database models and schemas
   - Validation schemas

4. **Database Files**
   - Schema definitions
   - Migration scripts
   - Seed data files

## Data Models

### Database Schema Changes

```sql
-- Before
CREATE TABLE weddings (
  ceremony_time TEXT NOT NULL,
  -- other fields
);

-- After
CREATE TABLE weddings (
  nuptials_time TEXT NOT NULL,
  -- other fields
);
```

### TypeScript Interface Changes

```typescript
// Before
interface Wedding {
  ceremonyTime: string;
  // other properties
}

// After
interface Wedding {
  nuptialsTime: string;
  // other properties
}
```

### API Response Changes

```json
// Before
{
  "ceremonyTime": "3:30 PM",
  "ceremonyVenue": "Church Name"
}

// After
{
  "nuptialsTime": "3:30 PM",
  "ceremonyVenue": "Church Name"
}
```

## Error Handling

### Potential Issues and Solutions

1. **Database Migration Conflicts**
   - **Issue**: Existing data might be lost during column rename
   - **Solution**: Create proper migration scripts with data preservation

2. **API Breaking Changes**
   - **Issue**: Frontend-backend communication might break
   - **Solution**: Update both frontend and backend simultaneously

3. **Form Validation Errors**
   - **Issue**: Form validation might reference old field names
   - **Solution**: Update all validation schemas and error messages

4. **TypeScript Compilation Errors**
   - **Issue**: Type mismatches after renaming
   - **Solution**: Update all type definitions and interfaces

## Testing Strategy

### Validation Steps

1. **Text Search Validation**
   - Search entire codebase for remaining "ceremony time" references
   - Verify all instances have been updated
   - Check for case variations and different formats

2. **Functional Testing**
   - Test form submission with new field names
   - Verify API responses use new property names
   - Test database operations with new column names

3. **Type Safety Testing**
   - Ensure TypeScript compilation succeeds
   - Verify no type errors in IDE
   - Test API contract compliance

4. **User Interface Testing**
   - Verify all labels display "nuptials time"
   - Test form interactions and validation
   - Check responsive design integrity

### Testing Checklist

- [ ] All "ceremony time" text updated to "nuptials time"
- [ ] All `ceremonyTime` variables renamed to `nuptialsTime`
- [ ] All `ceremony_time` database fields renamed to `nuptials_time`
- [ ] Form fields use new naming convention
- [ ] API responses use new property names
- [ ] TypeScript compilation successful
- [ ] Database migrations run successfully
- [ ] No broken form submissions
- [ ] All validation messages updated
- [ ] User-facing text displays correctly

## Implementation Phases

### Phase 1: Discovery and Planning
- Search codebase for all "ceremony time" instances
- Document current usage patterns
- Plan migration strategy for database changes

### Phase 2: Database Layer Updates
- Create migration scripts for column renaming
- Update schema definitions
- Update seed data if applicable

### Phase 3: Backend Layer Updates
- Update API route handlers
- Update validation schemas
- Update response formatting

### Phase 4: Frontend Layer Updates
- Update React components
- Update form fields and labels
- Update state management

### Phase 5: Shared Layer Updates
- Update TypeScript interfaces
- Update validation schemas
- Update constants and enums

### Phase 6: Testing and Validation
- Run comprehensive search for missed instances
- Test all affected functionality
- Verify database operations
- Validate user interface changes