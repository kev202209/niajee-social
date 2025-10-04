// __tests__/pages/auth/verify-email.test.tsx
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import VerifyEmailPage from '@/app/auth/verify-email/page';
import { render, createMockResponse, setupFetchMock, clearAllMocks } from '../../utils/testUtils';

// Mock the hooks
jest.mock('next/navigation');

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });

    // Setup search params mock
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockSearchParamsGet,
    });

    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe('initialization', () => {
    it('should show loading state initially', () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      expect(screen.getByRole('heading', { name: /email verification/i })).toBeInTheDocument();
      expect(screen.getByText(/verifying.../i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    it('should show error when no token is provided', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return null;
        if (param === 'redirect') return null;
        return null;
      });

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/no token provided/i)).toBeInTheDocument();
      });

      // Should show error styling
      const errorMessage = screen.getByText(/no token provided/i);
      expect(errorMessage.closest('div')).toHaveClass('text-red-800');
    });
  });

  describe('successful verification', () => {
    it('should verify email successfully and redirect to login', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/auth/verify-email?token=valid-token'
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });

      // Should show success styling
      const successMessage = screen.getByText(/email verified successfully/i);
      expect(successMessage.closest('div')).toHaveClass('text-green-800');

      // Should redirect to login after delay
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?verified=true');
      }, { timeout: 3000 });
    });

    it('should include redirect URL in login redirect', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return '/dashboard';
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fdashboard&verified=true');
      }, { timeout: 3000 });
    });

    it('should validate redirect URL for security', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return 'http://malicious-site.com';
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });

      // Should not include malicious redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?verified=true');
      }, { timeout: 3000 });
    });

    it('should allow valid frontend URLs as redirect', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return 'http://localhost:3000/dashboard';
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=http%3A%2F%2Flocalhost%3A3000%2Fdashboard&verified=true');
      }, { timeout: 3000 });
    });
  });

  describe('verification failure', () => {
    it('should handle verification failure', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'invalid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid or expired token' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
      });

      // Should show error styling
      const errorMessage = screen.getByText(/invalid or expired token/i);
      expect(errorMessage.closest('div')).toHaveClass('text-red-800');

      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle server error', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockRejectedValue(new Error('Server error'));
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/server error during verification/i)).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/server error during verification/i)).toBeInTheDocument();
      });
    });

    it('should use default error message when none provided', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'invalid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({})
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('duplicate verification prevention', () => {
    it('should prevent duplicate verification requests', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Even after component re-renders, should not call fetch again
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('URL handling', () => {
    it('should handle relative redirect URLs', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return '/dashboard';
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fdashboard&verified=true');
      }, { timeout: 3000 });
    });

    it('should handle encoded redirect URLs', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return '/dashboard?tab=settings';
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fdashboard%3Ftab%3Dsettings&verified=true');
      }, { timeout: 3000 });
    });
  });

  describe('UI states', () => {
    it('should clear loading state after verification', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      // Initially loading
      expect(screen.getByText(/verifying.../i)).toBeInTheDocument();

      // After verification
      await waitFor(() => {
        expect(screen.queryByText(/verifying.../i)).not.toBeInTheDocument();
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });
    });

    it('should clear loading state after error', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'invalid-token';
        if (param === 'redirect') return null;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid token' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      // Initially loading
      expect(screen.getByText(/verifying.../i)).toBeInTheDocument();

      // After error
      await waitFor(() => {
        expect(screen.queryByText(/verifying.../i)).not.toBeInTheDocument();
        expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
      });
    });

    it('should show processing message when not loading and no result yet', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        if (param === 'redirect') return null;
        return null;
      });

      // Mock a delay that keeps loading false but no message yet
      const mockFetch = jest.fn().mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      // Should eventually show processing message
      await waitFor(() => {
        expect(screen.getByText(/processing verification.../i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        return null;
      });

      render(<VerifyEmailPage />);

      const heading = screen.getByRole('heading', { name: /email verification/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('should provide status updates for screen readers', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return 'valid-token';
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      // Should have loading status
      expect(screen.getByRole('status')).toBeInTheDocument();

      // After verification, should have success message
      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty token', async () => {
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return '';
        return null;
      });

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText(/no token provided/i)).toBeInTheDocument();
      });
    });

    it('should handle very long tokens', async () => {
      const longToken = 'a'.repeat(1000);
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return longToken;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3001/auth/verify-email?token=${longToken}`
        );
      });
    });

    it('should handle special characters in token', async () => {
      const specialToken = 'token+with/special=chars&more';
      mockSearchParamsGet.mockImplementation((param) => {
        if (param === 'token') return specialToken;
        return null;
      });

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Email verified successfully' })
      });
      global.fetch = mockFetch;

      render(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3001/auth/verify-email?token=${encodeURIComponent(specialToken)}`
        );
      });
    });
  });
});