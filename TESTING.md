# Testing and Linting Guide

This document explains how to run tests and linting for both the web and mobile applications.

## Web Application

### Installation

First, install dependencies:

```bash
cd web
npm install
```

### Linting

Run ESLint to check code quality:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Testing

Run tests with Vitest:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Files

- Unit tests are located next to the files they test with `.test.ts` or `.test.tsx` extension
- Test setup is in `src/test/setup.ts`
- Current test files:
  - `src/lib/deviceStatus.test.ts` - Tests for device online/offline status
  - `src/lib/firebaseErrors.test.ts` - Tests for Firebase error handling

## Mobile Application

### Installation

First, install dependencies:

```bash
cd mobile
npm install
```

### Linting

Run ESLint to check code quality:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Testing

Run tests with Jest:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Files

- Unit tests are located in `lib/__tests__/` directory
- Test setup is in `jest.setup.js`
- Current test files:
  - `lib/__tests__/device.test.ts` - Tests for device platform utilities
  - `lib/__tests__/firebaseErrors.test.ts` - Tests for Firebase error handling

## CI/CD Integration

You can integrate these commands into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Test and Lint

on: [push, pull_request]

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd web && npm install
      - run: cd web && npm run lint
      - run: cd web && npm test

  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd mobile && npm install
      - run: cd mobile && npm run lint
      - run: cd mobile && npm test
```

## Writing New Tests

### Web Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### Mobile Tests (Jest)

```typescript
import { describe, it, expect } from '@jest/globals'

describe('MyFunction', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

## Code Coverage

Both projects are configured to generate coverage reports:

- **Web**: Coverage reports are in `web/coverage/`
- **Mobile**: Coverage reports are in `mobile/coverage/`

Open `coverage/index.html` in your browser to view detailed coverage reports.

## Pre-commit Hooks (Optional)

You can set up Husky to run linting and tests before commits:

```bash
npm install -D husky lint-staged
npx husky init
```

Add to `.husky/pre-commit`:

```bash
cd web && npm run lint && npm test
cd mobile && npm run lint && npm test
```
