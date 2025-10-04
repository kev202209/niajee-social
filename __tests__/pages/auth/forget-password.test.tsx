// __tests__/pages/auth/forget-password.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgetPasswordPage from '@/app/auth/forget-password/page';
import { render, createMockResponse, setupFetchMock, clearAllMocks } from '../../utils/testUtils';

// Mock fetch globally
global.fetch = jest.fn();

describe('ForgetPasswordPage', () => {
  beforeEach(() => {
    clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('rendering', () => {
    it('should render forgot password form', () => {
      render(<ForgetPasswordPage />);

      expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<ForgetPasswordPage />);

      const loginLink = screen.getByText(/remember your password\?/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/auth/login');
    });

    it('should render sign up link', () => {
      render(<ForgetPasswordPage />);

      const signUpLink = screen.getByText(/don't have an account\? sign up/i);
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/auth/register');
    });

    it('should render instructions', () => {
      render(<ForgetPasswordPage />);

      expect(screen.getByText(/enter your email to receive a password reset link/i)).toBeInTheDocument();
      expect(screen.getByText(/you will get an email with a secure link/i)).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should require email field', () => {
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      expect(emailInput).toBeRequired();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should disable submit button when email is empty', () => {
      render(<ForgetPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when email is provided', async () => {
      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('should submit form with valid email', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ 
          message: 'Password reset link sent. Check your email.' 
        }))
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/auth/forgot-password',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' }),
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const mockFetch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('pointer-events-none');
    });

    it('should show success message on successful submission', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ 
          message: 'Password reset link sent. Check your email.' 
        }))
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password reset link sent. check your email/i)).toBeInTheDocument();
      });

      // Should show success styling
      const successMessage = screen.getByText(/password reset link sent. check your email/i);
      expect(successMessage.closest('div')).toHaveClass('text-green-700');
    });

    it('should show default success message when none provided', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({}))
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password reset link sent. check your email/i)).toBeInTheDocument();
      });
    });

    it('should handle server error response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ 
          message: 'Email not found' 
        }))
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'notfound@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email not found/i)).toBeInTheDocument();
      });

      // Should show error styling
      const errorMessage = screen.getByText(/email not found/i);
      expect(errorMessage.closest('div')).toHaveClass('text-red-700');
    });

    it('should show default error message when none provided', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({}))
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to send password reset link/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connection error. please check your internet connection/i)).toBeInTheDocument();
      });
    });

    it('should handle malformed JSON response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('invalid json')
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connection error. please check your internet connection/i)).toBeInTheDocument();
      });
    });
  });

  describe('form state management', () => {
    it('should clear previous messages on new submission', async () => {
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          text: () => Promise.resolve(JSON.stringify({ message: 'Email not found' }))
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ message: 'Reset link sent' }))
        });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // First submission - error
      await user.type(emailInput, 'notfound@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email not found/i)).toBeInTheDocument();
      });

      // Second submission - success
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
        expect(screen.queryByText(/email not found/i)).not.toBeInTheDocument();
      });
    });

    it('should preserve email value between submissions', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      });

      // Email should still be in the input
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels and form structure', () => {
      render(<ForgetPasswordPage />);

      const emailLabel = screen.getByLabelText(/email address/i);
      expect(emailLabel).toBeInTheDocument();
      expect(emailLabel).toHaveAttribute('type', 'email');
    });

    it('should have proper form structure', () => {
      render(<ForgetPasswordPage />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper button states for screen readers', async () => {
      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Enabled after email entry
      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('styling and appearance', () => {
    it('should apply correct styling classes', () => {
      render(<ForgetPasswordPage />);

      const container = screen.getByRole('heading', { name: /forgot password/i }).closest('div');
      expect(container).toHaveClass('bg-white', 'dark:bg-gray-800');
    });

    it('should have animated border styling', () => {
      render(<ForgetPasswordPage />);

      const formContainer = screen.getByRole('heading', { name: /forgot password/i }).closest('div');
      expect(formContainer).toHaveClass('animate-border');
    });
  });

  describe('edge cases', () => {
    it('should handle empty response body', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('')
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      });
    });

    it('should handle extremely long email addresses', async () => {
      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const longEmail = 'a'.repeat(100) + '@example.com';

      await user.type(emailInput, longEmail);
      expect(emailInput).toHaveValue(longEmail);
    });

    it('should handle special characters in email', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ message: 'Reset link sent' }))
      });
      global.fetch = mockFetch;

      const user = userEvent.setup();
      render(<ForgetPasswordPage />);

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      const specialEmail = 'test+special@example.com';

      await user.type(emailInput, specialEmail);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ email: specialEmail }),
          })
        );
      });
    });
  });
});