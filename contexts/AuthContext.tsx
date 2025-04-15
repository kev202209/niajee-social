'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    firstName: string,
    birthday?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  sendResetPasswordOtp: (email: string) => Promise<void>;
  verifyResetOtp: (otp: string) => Promise<void>;
  resetPassword: (
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Since the cookie is HttpOnly, we rely on the server to verify it.
      const response = await fetch('http://localhost:5000/auth/verify', {
        method: 'GET',
        credentials: 'include', // Ensures the HttpOnly cookie is sent automatically
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        credentials: 'include', // Allow the backend to set the HttpOnly cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
          deviceDetails: {
            device: navigator.userAgent,
            location: 'Unknown'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Login failed. Please check your internet connection.'
        );
      }

      // The server sets the HttpOnly cookie; just update the user state
      setUser(data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    firstName: string,
    birthday?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          firstName,
          birthday,
          deviceDetails: navigator.userAgent
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Registration failed. Please check your internet connection.'
        );
      }

      // Registration may require email verification before logging in.
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/verify-email/${token}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Email verification failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const sendResetPasswordOtp = async (email: string) => {
    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset OTP');
      }
    } catch (error) {
      throw error;
    }
  };

  const verifyResetOtp = async (otp: string) => {
    try {
      const response = await fetch('http://localhost:5000/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:5000/auth/check-email/${email}`);
      return response.ok;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Call the backend logout endpoint to clear the HttpOnly cookie
      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        verifyEmail,
        sendResetPasswordOtp,
        verifyResetOtp,
        resetPassword,
        checkEmailAvailability
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
