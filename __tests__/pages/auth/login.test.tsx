// __tests__/pages/auth/login.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginPage from '@/app/auth/login/page';
import { useAuth } from '@/contexts/AuthContext';
import { render, createMockResponse, setupFetchMock, clearAllMocks } from '../../utils/testUtils';

// Mock the hooks
jest.mock('next/navigation');
jest.mock('@/contexts/AuthContext');
jest.mock('@/utils/deviceInfo');

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();
const mockLogin = jest.fn();

describe('LoginPage', () => {
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

    // Setup auth context mock
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      user: null,
      loading: false,
      error: null,
    });

    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  describe('rendering', () => {
    it('should render login form', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your email or username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render sign up link', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      const signUpLink = screen.getByText(/don't have an account\?/i);
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/auth/register');
    });

    it('should render Google login button', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /login with google/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      const forgotPasswordLink = screen.getByText(/forgot password/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/auth/forget-password');
    });
  });

  describe('form validation', () => {
    it('should require identifier field', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      expect(identifierInput).toBeRequired();
    });

    it('should require password field', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(passwordInput).toBeRequired();
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockLogin.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          expect.objectContaining({
            userAgent: 'test-user-agent',
            platform: 'test-platform',
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('should handle login success and redirect to home', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockLogin.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should handle login failure with specific error', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle generic login failure', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockLogin.mockRejectedValue(new Error('Some server error'));
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong, try again later/i)).toBeInTheDocument();
      });
    });
  });

  describe('redirect functionality', () => {
    it('should include redirect URL in sign up link', () => {
      mockSearchParamsGet.mockReturnValue('/dashboard');
      
      render(<LoginPage />);

      const signUpLink = screen.getByText(/don't have an account\?/i);
      expect(signUpLink.closest('a')).toHaveAttribute(
        'href', 
        '/auth/register?redirect=%2Fdashboard'
      );
    });

    it('should redirect to specified URL after successful login', async () => {
      mockSearchParamsGet.mockReturnValue('/dashboard');
      mockLogin.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('should validate redirect URL for security', async () => {
      mockSearchParamsGet.mockReturnValue('http://malicious-site.com');
      mockLogin.mockResolvedValue(undefined);
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const identifierInput = screen.getByPlaceholderText(/enter your email or username/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(identifierInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Google login', () => {
    it('should redirect to Google OAuth URL', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login with google/i });
      await user.click(googleButton);

      expect(window.location.href).toBe('http://localhost:3001/auth/google');
      expect(localStorage.setItem).toHaveBeenCalledWith('lastLoginMethod', 'google');
    });

    it('should include redirect URL in Google OAuth', async () => {
      mockSearchParamsGet.mockReturnValue('/dashboard');
      const user = userEvent.setup();
      
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /login with google/i });
      await user.click(googleButton);

      expect(window.location.href).toBe(
        'http://localhost:3001/auth/google?redirect=%2Fdashboard'
      );
    });
  });

  describe('last login method indicator', () => {
    it('should show last used method when available', () => {
      mockSearchParamsGet.mockReturnValue(null);
      (localStorage.getItem as jest.Mock).mockReturnValue('email');
      
      render(<LoginPage />);

      expect(screen.getByText(/last used: email\/password/i)).toBeInTheDocument();
    });

    it('should show Google as last used method', () => {
      mockSearchParamsGet.mockReturnValue(null);
      (localStorage.getItem as jest.Mock).mockReturnValue('google');
      
      render(<LoginPage />);

      expect(screen.getByText(/last used: google/i)).toBeInTheDocument();
    });

    it('should not show indicator when no last method', () => {
      mockSearchParamsGet.mockReturnValue(null);
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      render(<LoginPage />);

      expect(screen.queryByText(/last used:/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels and form structure', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      const identifierLabel = screen.getByLabelText(/email or username/i);
      const passwordLabel = screen.getByLabelText(/password/i);
      
      expect(identifierLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<LoginPage />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });
});