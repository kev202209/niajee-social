# Authentication Test Suite

This directory contains comprehensive tests for the authentication system of the Niajee Social App.

## Test Structure

```
__tests__/
├── setup.ts                    # Global test setup and mocks
├── utils/
│   ├── testUtils.tsx           # Custom render functions and test utilities
│   └── mockTypes.ts            # TypeScript types for test mocks
├── contexts/
│   └── AuthContext.test.tsx    # AuthContext hook tests
├── pages/auth/
│   ├── login.test.tsx          # Login page component tests
│   ├── register.test.tsx       # Registration page component tests
│   ├── forget-password.test.tsx # Forgot password page tests
│   └── verify-email.test.tsx   # Email verification page tests
└── integration/
    └── authFlow.test.tsx       # End-to-end authentication flow tests
```

## Test Coverage

### AuthContext Tests (`contexts/AuthContext.test.tsx`)
- ✅ Provider initialization and CSRF token handling
- ✅ Login functionality with success/failure scenarios
- ✅ Registration with validation and error handling
- ✅ Email availability checking
- ✅ Password reset flow (send OTP, verify OTP, reset password)
- ✅ Email verification
- ✅ Logout functionality
- ✅ CSRF token refresh on 403 responses
- ✅ Network error handling
- ✅ State management and loading states

### Login Page Tests (`pages/auth/login.test.tsx`)
- ✅ Form rendering and validation
- ✅ Password visibility toggle
- ✅ Form submission with success/failure handling
- ✅ Redirect functionality with security validation
- ✅ Google OAuth integration
- ✅ Last login method indicator
- ✅ Accessibility features
- ✅ Loading states and error messages

### Registration Page Tests (`pages/auth/register.test.tsx`)
- ✅ Multi-step form flow (basic info → birthday → password → verification)
- ✅ Email availability checking
- ✅ Form validation and error handling
- ✅ Password confirmation matching
- ✅ Age validation (13+ requirement)
- ✅ Registration submission with device info
- ✅ Google signup integration
- ✅ Redirect parameter handling
- ✅ Terms and conditions links

### Forgot Password Tests (`pages/auth/forget-password.test.tsx`)
- ✅ Form rendering and validation
- ✅ Email submission with success/failure scenarios
- ✅ Loading states and user feedback
- ✅ Network error handling
- ✅ Malformed response handling
- ✅ Navigation links to login/register
- ✅ Accessibility compliance

### Email Verification Tests (`pages/auth/verify-email.test.tsx`)
- ✅ Token validation and verification process
- ✅ Success/failure scenarios
- ✅ Redirect handling with security validation
- ✅ Duplicate verification prevention
- ✅ URL parameter handling
- ✅ Loading states and error messages
- ✅ Accessibility features

### Integration Tests (`integration/authFlow.test.tsx`)
- ✅ Complete registration to verification flow
- ✅ Login with redirect functionality
- ✅ Cross-page navigation and state persistence
- ✅ Error handling across different pages
- ✅ Security validation for redirects
- ✅ Authentication state management
- ✅ Accessibility standards compliance

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci
```

### Specific Test Categories
```bash
# Run only AuthContext tests
npm test -- AuthContext

# Run only page component tests
npm test -- pages/auth

# Run only integration tests
npm test -- integration

# Run with verbose output
npm test -- --verbose
```

## Test Utilities

### Custom Render Function
The test suite includes a custom render function that wraps components with necessary providers:

```typescript
import { render } from '../utils/testUtils';

// Automatically wraps with AuthProvider
render(<LoginPage />);
```

### Mock Utilities
- `createMockResponse()` - Creates mock fetch responses
- `setupFetchMock()` - Sets up fetch mocks for multiple requests
- `clearAllMocks()` - Resets all mocks between tests
- `mockUser` - Pre-configured user object for testing

### Test Data
All test data is centralized in `testUtils.tsx` and `mockTypes.ts` for consistency across tests.

## Code Coverage

The test suite aims for comprehensive coverage of:
- **Authentication Context**: 100% coverage of all auth methods
- **Page Components**: 95%+ coverage of user interactions and edge cases
- **Error Scenarios**: Network errors, validation errors, and server errors
- **Security Features**: Redirect validation, CSRF protection, input sanitization
- **Accessibility**: Screen reader support, keyboard navigation, form labels

## Mocking Strategy

### External Dependencies
- **Next.js Router**: Mocked to test navigation without actual routing
- **Device Info**: Mocked to provide consistent device data
- **Fetch API**: Mocked to simulate network requests without hitting real APIs
- **localStorage/sessionStorage**: Mocked for consistent browser storage testing

### API Responses
All API responses are mocked to test various scenarios:
- Success responses with different data structures
- Error responses with various status codes
- Network timeouts and connection failures
- Malformed JSON responses

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't rely on others
2. **Mock Management**: All mocks are cleared between tests
3. **User-Centric Testing**: Tests simulate real user interactions
4. **Accessibility Testing**: All tests include accessibility assertions
5. **Error Scenarios**: Comprehensive error handling testing
6. **Security Testing**: Validation of security features and edge cases

## Continuous Integration

The test suite is designed to run in CI environments with:
- No watch mode for automated testing
- Coverage reporting for code quality metrics
- Proper exit codes for build pipeline integration
- Timeout handling for long-running tests

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in jest.config.json
2. **Mock not working**: Ensure mocks are cleared in beforeEach
3. **Component not rendering**: Check if all required providers are included
4. **Async tests failing**: Use waitFor() for async operations

### Debug Mode
```bash
# Run with debug output
npm test -- --verbose --no-cache

# Run single test file
npm test -- login.test.tsx

# Run with coverage for specific file
npm test -- --coverage --collectCoverageFrom="contexts/AuthContext.tsx"
```