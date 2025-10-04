// __tests__/utils/testUtils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock User type to match your types
export const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  username: 'johndoe',
  profilePic: 'https://example.com/pic.jpg',
  isVerified: true,
  createdAt: '2025-10-03T00:00:00.000Z',
  updatedAt: '2025-10-03T00:00:00.000Z',
};

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper to create mock fetch responses
export const createMockResponse = (data: any, status = 200, ok = true) => ({
  json: jest.fn().mockResolvedValue(data),
  ok,
  status,
});

// Helper to setup fetch mock
export const setupFetchMock = (responses: any[]) => {
  const mockFetch = jest.fn();
  responses.forEach((response, index) => {
    mockFetch.mockImplementationOnce(() => Promise.resolve(response));
  });
  global.fetch = mockFetch;
  return mockFetch;
};

// Helper to clear all mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear?.();
  (localStorage.getItem as jest.Mock).mockClear?.();
  (localStorage.setItem as jest.Mock).mockClear?.();
  (localStorage.removeItem as jest.Mock).mockClear?.();
};

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));