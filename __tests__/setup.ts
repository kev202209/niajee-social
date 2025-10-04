// __tests__/setup.ts
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_FRONTEND_A_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_FRONTEND_B_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_MAIN_URL = 'http://localhost:3000';

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock device info utility
jest.mock('../utils/deviceInfo', () => ({
  getDeviceInfo: jest.fn().mockResolvedValue({
    userAgent: 'test-user-agent',
    platform: 'test-platform',
    timestamp: '2025-10-03T00:00:00.000Z',
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock window.location
delete (window as any).location;
window.location = {
  href: '',
  search: '',
} as any;