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
      username: string;
      password: string;
      birthday: string;
      profilePic?: File | null;
    },
    deviceInfo: any
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
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${api_link}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
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
        },
        body: JSON.stringify({
          identifier,
          password,
          deviceInfo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Login failed. Please check your internet connection.'
        );
      }
      setUser(data.user);
    } catch (err) {
      const errorMessage = handleFetchError(err, 'Login failed');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated register function to match your page logic exactly
  const register = async (
    formData: {
      firstName: string;
      lastName: string;
      email: string;
      username: string;
      password: string;
      birthday: string;
      profilePic?: File | null;
    },
    deviceInfo: any
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData for multipart upload (exactly like your page)
      const uploadFormData = new FormData();
      
      // Create the nested registerDto structure
      const registerDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        birthday: formData.birthday,
      };

      // Append data as JSON strings (backend will parse them)
      uploadFormData.append('registerDto', JSON.stringify(registerDto));
      uploadFormData.append('deviceInfo', JSON.stringify(deviceInfo));
      
      // Append profile picture if exists
      if (formData.profilePic) {
        uploadFormData.append('profilePic', formData.profilePic);
      }

      // Send as multipart/form-data (exactly like your page)
      const response = await fetch(`${api_link}/auth/register`, {
        method: 'POST',
        body: uploadFormData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

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
        method: 'POST'
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
          'Content-Type': 'application/json', // Important: Tell the backend we're sending JSON
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
