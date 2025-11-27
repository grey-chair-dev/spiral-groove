# Unit Tests

This directory contains unit tests for the Spiral Groove Records application.

## Test Structure

- `lib/db/lookup-tables.test.ts` - Tests for Artist, Label, and Genre CRUD operations
- `app/api/staff/artists.test.ts` - Tests for the Artists API endpoints

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Framework

We use [Vitest](https://vitest.dev/) for testing, which provides:
- Fast test execution
- Built-in TypeScript support
- Jest-compatible API
- Excellent mocking capabilities

## Writing Tests

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Mocking

We mock external dependencies like:
- Database (`@/lib/db`)
- Authentication (`@/lib/api/auth-helpers`)
- Next.js server components (`next/server`, `next/headers`)

## Test Coverage Goals

- **Unit Tests**: Test individual functions and modules in isolation
- **Integration Tests**: Test API endpoints with mocked dependencies
- **Coverage Target**: Aim for 80%+ coverage on critical paths

## Notes

- Tests use mocks to avoid requiring a real database connection
- Authentication is mocked to test authorization logic
- All tests should be deterministic and not depend on external services

