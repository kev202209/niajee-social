// __tests__/integration/authFlow.test.tsx
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginPage from '@/app/auth/login/page';
import RegisterPage from '@/app/auth/register/page';
import { useAuth } from '@/contexts/AuthContext';
import { render, createMockResponse, setupFetchMock, clearAllMocks, mockUser } from '../utils/testUtils';

jest.mock('next/navigation');
jest.mock('@/contexts/AuthContext');
jest.mock('@/utils/deviceInfo');

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockCheckEmailAvailability = jest.fn();

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockSearchParamsGet,
    });

    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  describe('Complete Registration to Login Flow', () => {
    it('should complete full registration flow and redirect to login', async () => {
      // Setup mocks for registration flow
      (useAuth as jest.Mock).mockReturnValue({
        register: mockRegister,
        checkEmailAvailability: mockCheckEmailAvailability,
        user: null,
        loading: false,
        error: null,
      });

      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      mockRegister.mockResolvedValue({ message: 'Registration successful' });
      
      const user = userEvent.setup();
      
      // Render registration page
      render(<RegisterPage />);

      // Step 1: Fill basic information
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Verify email check was called
      await waitFor(() => {
        expect(mockCheckEmailAvailability).toHaveBeenCalledWith('john@example.com');
      });

      // Step 2: Birthday (skip for simplicity in this integration test)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Step 3: Password setup
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      });
      
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Verify registration was called with correct data
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
          expect.any(Object),
          undefined
        );
      });

      // Step 4: Should show verification step
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
      });
    });
  });

  describe('Login with Redirect Flow', () => {
    it('should login and redirect to specified page', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        user: null,
        loading: false,
        error: null,
      });

      mockSearchParamsGet.mockReturnValue('/dashboard');
      mockLogin.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      
      render(<LoginPage />);

      // Fill login form
      await user.type(screen.getByPlaceholderText(/enter your email or username/i), 'john@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify login was called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'john@example.com',
          'password123',
          expect.any(Object)
        );
      });

      // Should redirect to specified URL
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('should show security validation for malicious redirects', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        user: null,
        loading: false,
        error: null,
      });

      mockSearchParamsGet.mockReturnValue('http://malicious-site.com');
      mockLogin.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      
      render(<LoginPage />);

      await user.type(screen.getByPlaceholderText(/enter your email or username/i), 'john@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      // Should redirect to safe default instead of malicious URL
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Error Handling Across Pages', () => {
    it('should handle registration errors gracefully', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        register: mockRegister,
        checkEmailAvailability: mockCheckEmailAvailability,
        user: null,
        loading: false,
        error: null,
      });

      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      mockRegister.mockRejectedValue(new Error('Email already exists'));
      
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Complete registration flow quickly
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'existing@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText(/^password$/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/registration failed. please try again/i)).toBeInTheDocument();
      });
    });

    it('should handle login errors gracefully', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        user: null,
        loading: false,
        error: null,
      });

      mockSearchParamsGet.mockReturnValue(null);
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      
      const user = userEvent.setup();
      
      render(<LoginPage />);

      await user.type(screen.getByPlaceholderText(/enter your email or username/i), 'wrong@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Page Navigation', () => {
    it('should maintain redirect parameter across auth pages', () => {
      mockSearchParamsGet.mockReturnValue('/dashboard');
      
      // Test login page
      const { unmount } = render(<LoginPage />);
      
      const signUpLink = screen.getByText(/don't have an account\?/i);
      expect(signUpLink.closest('a')).toHaveAttribute(
        'href', 
        '/auth/register?redirect=%2Fdashboard'
      );
      
      unmount();

      // Test register page  
      render(<RegisterPage />);
      
      const loginLink = screen.getByText(/already have an account\?/i);
      expect(loginLink.closest('a')).toHaveAttribute(
        'href', 
        '/auth/login?redirect=%2Fdashboard'
      );
    });
  });

  describe('State Management Integration', () => {
    it('should handle authentication state changes', async () => {
      let authState = {
        login: mockLogin,
        user: null,
        loading: false,
        error: null,
      };

      (useAuth as jest.Mock).mockImplementation(() => authState);

      mockSearchParamsGet.mockReturnValue(null);
      mockLogin.mockImplementation(async () => {
        authState.user = mockUser;
        authState.loading = false;
      });
      
      const user = userEvent.setup();
      
      render(<LoginPage />);

      // Initially no user
      expect(authState.user).toBe(null);

      // Perform login
      await user.type(screen.getByPlaceholderText(/enter your email or username/i), 'john@example.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility standards across auth pages', () => {
      // Test login page accessibility
      const { unmount: unmountLogin } = render(<LoginPage />);
      
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      
      unmountLogin();

      // Test register page accessibility
      render(<RegisterPage />);
      
      expect(screen.getByRole('heading', { name: /welcome to niajee/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    });
  });
});