'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string, deviceInfo: any) => Promise<void>;
  register: (
    formData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      birthday: string;
    },
    deviceInfo: any,
    redirect?: string
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
  csrfToken: string | null;
  setCsrfToken: (token: string | null) => void;
  getCsrf: () => Promise<void>;  // Add this
}

const AuthContext = createContext<AuthContextType | null>(null);

// Utility function to handle fetch errors
const handleFetchError = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error. Please check your internet connection.';
  }
  return error instanceof Error ? error.message : fallbackMessage;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  // Add getCsrf function
  const getCsrf = async () => {
    try {
      const response = await fetch(`${api_link}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',  // Include cookies for session
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } else {
        console.error('Failed to fetch CSRF token');
      }
    } catch (err) {
      console.error('CSRF fetch error:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await getCsrf();  // Fetch token first
      await checkAuth();  // Then check auth with token
    };
    initAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${api_link}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else if (response.status === 403) {  // Assume 403 for invalid CSRF
        console.warn('CSRF invalid, refreshing token');
        await getCsrf();  // Refresh token
        // Optionally retry checkAuth here
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(handleFetchError(err, 'Authentication check failed'));
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string, deviceInfo: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${api_link}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify({
          identifier,
          password,
          deviceInfo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          await getCsrf();  // Refresh and retry if CSRF issue
          // Optionally throw or retry
        }
        throw new Error(
          data.message || 'Login failed. Please check your internet connection.'
        );
      }
      setUser(data.user);
      setCsrfToken(data.csrfToken || null);  // Capture and store
    } catch (err) {
      const errorMessage = handleFetchError(err, 'Login failed');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    formData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      birthday: string;
    },
    deviceInfo: any,
    redirect?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const registerDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        birthday: formData.birthday,
      };

      // Send JSON (not multipart/form-data) — backend expects JSON for this endpoint
      const response = await fetch(`${api_link}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify({
          ...registerDto,
          deviceInfo,
          // backend expects "redirect"
          redirect: redirect ?? null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // preserve internal error for logging in context, but throw a generic message to caller
        const backendMessage = data?.message;
        setError(backendMessage || 'Registration failed');
        throw new Error(backendMessage || 'Registration failed');
      }

      setCsrfToken(data.csrfToken || null);  // If added to register response

      return data;
    } catch (err) {
      const errorMessage = handleFetchError(err, 'Registration failed');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${api_link}/auth/verify-email/${token}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
      });

      if (!response.ok) {
        throw new Error('Email verification failed');
      }
    } catch (err) {
      throw new Error(handleFetchError(err, 'Email verification failed'));
    }
  };

  const sendResetPasswordOtp = async (email: string) => {
    try {
      const response = await fetch(`${api_link}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset OTP');
      }
    } catch (err) {
      throw new Error(handleFetchError(err, 'Failed to send reset OTP'));
    }
  };

  const verifyResetOtp = async (otp: string) => {
    try {
      const response = await fetch(`${api_link}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify({ otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }
    } catch (err) {
      throw new Error(handleFetchError(err, 'Invalid OTP'));
    }
  };

  const resetPassword = async (
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      const response = await fetch(`${api_link}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify({ otp, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }
    } catch (err) {
      throw new Error(handleFetchError(err, 'Password reset failed'));
    }
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${api_link}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        credentials: 'include',
        body: JSON.stringify({ email }), // Send the email in the request body as JSON
      });
      return response.ok;
    } catch (err) {
      throw new Error(handleFetchError(err, 'Email availability check failed'));
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api_link}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
      });
      if (response.ok) {
        setUser(null);
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      const errorMessage = handleFetchError(err, 'Logout failed');
      setError(errorMessage);
      throw new Error(errorMessage);
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
        checkEmailAvailability,
        csrfToken,
        setCsrfToken,
        getCsrf,
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
