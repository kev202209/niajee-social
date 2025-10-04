// __tests__/pages/auth/register.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import RegisterPage from '@/app/auth/register/page';
import { useAuth } from '@/contexts/AuthContext';
import { render, createMockResponse, setupFetchMock, clearAllMocks } from '../../utils/testUtils';

// Mock the hooks
jest.mock('next/navigation');
jest.mock('@/contexts/AuthContext');
jest.mock('@/utils/deviceInfo');

// Mock date-fns functions
jest.mock('date-fns', () => ({
  differenceInYears: jest.fn((date1, date2) => {
    const year1 = new Date(date1).getFullYear();
    const year2 = new Date(date2).getFullYear();
    return year1 - year2;
  }),
  parseISO: jest.fn((date) => new Date(date)),
}));

const mockSearchParamsGet = jest.fn();
const mockRegister = jest.fn();
const mockCheckEmailAvailability = jest.fn();

describe('RegisterPage', () => {
  beforeEach(() => {
    clearAllMocks();
    
    // Setup search params mock
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockSearchParamsGet,
    });

    // Setup auth context mock
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      checkEmailAvailability: mockCheckEmailAvailability,
      user: null,
      loading: false,
      error: null,
    });

    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  describe('step 1 - basic information', () => {
    it('should render initial step with name and email fields', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<RegisterPage />);

      expect(screen.getByRole('heading', { name: /welcome to niajee/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should show login link', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<RegisterPage />);

      const loginLink = screen.getByText(/already have an account\?/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/auth/login');
    });

    it('should render Google signup button', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<RegisterPage />);

      expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
    });

    it('should disable continue button when fields are empty', () => {
      mockSearchParamsGet.mockReturnValue(null);
      
      render(<RegisterPage />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('should enable continue button when all fields are filled', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      const firstNameInput = screen.getByPlaceholderText(/first name/i);
      const lastNameInput = screen.getByPlaceholderText(/last name/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');

      expect(continueButton).not.toBeDisabled();
    });

    it('should check email availability and proceed to step 2', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      const firstNameInput = screen.getByPlaceholderText(/first name/i);
      const lastNameInput = screen.getByPlaceholderText(/last name/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.click(continueButton);

      await waitFor(() => {
        expect(mockCheckEmailAvailability).toHaveBeenCalledWith('john@example.com');
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });
    });

    it('should handle email unavailable', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(false);
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      const firstNameInput = screen.getByPlaceholderText(/first name/i);
      const lastNameInput = screen.getByPlaceholderText(/last name/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'taken@example.com');
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/email is already registered/i)).toBeInTheDocument();
      });
    });

    it('should handle email check failure', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      const firstNameInput = screen.getByPlaceholderText(/first name/i);
      const lastNameInput = screen.getByPlaceholderText(/last name/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const continueButton = screen.getByRole('button', { name: /continue/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to check email availability/i)).toBeInTheDocument();
      });
    });
  });

  describe('step 2 - birthday', () => {
    beforeEach(async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Fill step 1 and proceed
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });
    });

    it('should render birthday step', () => {
      expect(screen.getByText(/birthday/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter your real birthday/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should disable continue button when no birthday is selected', () => {
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('should go back to step 1 when back button is clicked', async () => {
      const user = userEvent.setup();
      
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      expect(screen.getByRole('heading', { name: /welcome to niajee/i })).toBeInTheDocument();
    });
  });

  describe('step 3 - password', () => {
    beforeEach(async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Navigate to step 3
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });

      // Proceed to step 3
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      });
    });

    it('should render password step', () => {
      expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByText(/terms and conditions/i)).toBeInTheDocument();
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' }); // Eye icon buttons

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('should show password mismatch error', async () => {
      const user = userEvent.setup();
      
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should clear password error when passwords match', async () => {
      const user = userEvent.setup();
      
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

      // First create mismatch
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different');
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

      // Then fix it
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'password123');
      
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });

    it('should show terms and conditions link', () => {
      const termsLink = screen.getByText(/terms and conditions/i);
      expect(termsLink.closest('a')).toHaveAttribute('href', expect.stringContaining('/terms'));
      expect(termsLink.closest('a')).toHaveAttribute('target', '_blank');
    });
  });

  describe('registration submission', () => {
    it('should complete registration successfully', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      mockRegister.mockResolvedValue({ message: 'Registration successful' });
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Step 1
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });

      // Step 2 - Skip birthday for now and proceed
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      });

      // Step 3
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
      const createAccountButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(createAccountButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
          expect.objectContaining({
            userAgent: 'test-user-agent',
            platform: 'test-platform',
          }),
          undefined
        );
      });

      // Should proceed to verification step
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
      });
    });

    it('should handle registration failure', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      mockRegister.mockRejectedValue(new Error('Email already exists'));
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Navigate through steps quickly
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      });

      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
      const createAccountButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(createAccountButton);

      await waitFor(() => {
        expect(screen.getByText(/registration failed. please try again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Google signup', () => {
    it('should redirect to Google OAuth URL', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      await user.click(googleButton);

      expect(window.location.href).toBe('http://localhost:3001/auth/google');
    });

    it('should include redirect URL in Google OAuth', async () => {
      mockSearchParamsGet.mockReturnValue('/dashboard');
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      const googleButton = screen.getByRole('button', { name: /sign up with google/i });
      await user.click(googleButton);

      expect(window.location.href).toBe(
        'http://localhost:3001/auth/google?redirect=%2Fdashboard'
      );
    });
  });

  describe('redirect functionality', () => {
    it('should include redirect URL in login link', () => {
      mockSearchParamsGet.mockReturnValue('/dashboard');
      
      render(<RegisterPage />);

      const loginLink = screen.getByText(/already have an account\?/i);
      expect(loginLink.closest('a')).toHaveAttribute(
        'href', 
        '/auth/login?redirect=%2Fdashboard'
      );
    });

    it('should pass redirect URL to registration', async () => {
      mockSearchParamsGet.mockReturnValue('/dashboard');
      mockCheckEmailAvailability.mockResolvedValue(true);
      mockRegister.mockResolvedValue({ message: 'Registration successful' });
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Navigate through registration quickly
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      });

      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
      const createAccountButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(createAccountButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          '/dashboard'
        );
      });
    });

    it('should validate redirect URL for security', async () => {
      mockSearchParamsGet.mockReturnValue('http://malicious-site.com');
      mockCheckEmailAvailability.mockResolvedValue(true);
      mockRegister.mockResolvedValue({ message: 'Registration successful' });
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Check that malicious redirect is not used in login link
      const loginLink = screen.getByText(/already have an account\?/i);
      expect(loginLink.closest('a')).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('step 4 - verification', () => {
    it('should show verification message', async () => {
      mockSearchParamsGet.mockReturnValue(null);
      mockCheckEmailAvailability.mockResolvedValue(true);
      mockRegister.mockResolvedValue({ message: 'Registration successful' });
      const user = userEvent.setup();
      
      render(<RegisterPage />);

      // Complete registration flow
      await user.type(screen.getByPlaceholderText(/first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your details/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /set up password/i })).toBeInTheDocument();
      });

      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
      const createAccountButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(createAccountButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
        expect(screen.getByText(/please check your email for verification/i)).toBeInTheDocument();
        expect(screen.getByText(/spam folder/i)).toBeInTheDocument();
      });
    });
  });
});