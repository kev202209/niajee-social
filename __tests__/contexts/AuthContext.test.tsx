// __tests__/contexts/AuthContext.test.tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { createMockResponse, setupFetchMock, clearAllMocks, mockUser } from '../utils/testUtils';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe('Provider initialization', () => {
    it('should initialize with loading state', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse(mockUser),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should fetch CSRF token on initialization', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse(mockUser),
      ]);

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/auth/csrf',
          expect.objectContaining({
            method: 'GET',
            credentials: 'include',
          })
        );
      });
    });

    it('should check authentication status on initialization', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse(mockUser),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/verify',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ user: mockUser, csrfToken: 'new-csrf' }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123', {
          userAgent: 'test-agent',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBe(null);
      expect(localStorage.setItem).toHaveBeenCalledWith('lastLoginMethod', 'email');
    });

    it('should handle login failure', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Invalid credentials' }, 401, false),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword', {
            userAgent: 'test-agent',
          });
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle network errors during login', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
      ]);

      // Mock fetch to throw network error
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new TypeError('Failed to fetch'))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'password123', {
            userAgent: 'test-agent',
          });
        })
      ).rejects.toThrow('Network error. Please check your internet connection.');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ 
          message: 'Registration successful',
          csrfToken: 'new-csrf' 
        }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        birthday: '1990-01-01',
      };

      await act(async () => {
        await result.current.register(formData, { userAgent: 'test-agent' });
      });

      expect(result.current.error).toBe(null);
    });

    it('should handle registration failure', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Email already exists' }, 400, false),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        birthday: '1990-01-01',
      };

      await expect(
        act(async () => {
          await result.current.register(formData, { userAgent: 'test-agent' });
        })
      ).rejects.toThrow('Email already exists');

      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('checkEmailAvailability', () => {
    it('should return true for available email', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Email available' }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let isAvailable: boolean;
      await act(async () => {
        isAvailable = await result.current.checkEmailAvailability('test@example.com');
      });

      expect(isAvailable!).toBe(true);
    });

    it('should return false for unavailable email', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Email taken' }, 400, false),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let isAvailable: boolean;
      await act(async () => {
        isAvailable = await result.current.checkEmailAvailability('taken@example.com');
      });

      expect(isAvailable!).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse(mockUser), // Initial auth check
        createMockResponse({ message: 'Logged out' }), // Logout response
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('lastLoginMethod');
    });

    it('should handle logout failure', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse(mockUser), // Initial auth check
        createMockResponse({ message: 'Logout failed' }, 500, false),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await expect(
        act(async () => {
          await result.current.logout();
        })
      ).rejects.toThrow('Logout failed');
    });
  });

  describe('password reset flow', () => {
    beforeEach(async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
      ]);
    });

    it('should send reset password OTP', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'OTP sent' }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.sendResetPasswordOtp('test@example.com');
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });

    it('should verify reset OTP', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'OTP verified' }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.verifyResetOtp('123456');
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/auth/verify-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ otp: '123456' }),
        })
      );
    });

    it('should reset password', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Password reset successful' }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resetPassword('123456', 'newpassword', 'newpassword');
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ 
            otp: '123456', 
            newPassword: 'newpassword', 
            confirmPassword: 'newpassword' 
          }),
        })
      );
    });
  });

  describe('email verification', () => {
    it('should verify email successfully', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Email verified' }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.verifyEmail('verification-token');
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/auth/verify-email?token=verification-token',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should handle email verification failure', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Invalid token' }, 400, false),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.verifyEmail('invalid-token');
        })
      ).rejects.toThrow('Email verification failed');
    });
  });

  describe('CSRF handling', () => {
    it('should refresh CSRF token on 403 response', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'CSRF invalid' }, 403, false),
        createMockResponse({ csrfToken: 'new-csrf' }), // New CSRF token
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // The context should have attempted to refresh CSRF
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/csrf',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('should include CSRF token in protected requests', async () => {
      const mockFetch = setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
        createMockResponse({ message: 'Not authenticated' }, 401, false),
        createMockResponse({ message: 'Email available' }),
      ]);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.checkEmailAvailability('test@example.com');
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-csrf-token': 'test-csrf',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
      ]);

      // Mock network error for auth check
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new TypeError('Failed to fetch'))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Network error. Please check your internet connection.');
      });
    });

    it('should handle unknown errors', async () => {
      setupFetchMock([
        createMockResponse({ csrfToken: 'test-csrf' }),
      ]);

      // Mock unknown error
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Unknown error'))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Unknown error');
      });
    });
  });
});