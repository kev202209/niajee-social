'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@/types';
import { DeviceInfo } from '@/utils/deviceInfo'; 

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string, deviceInfo: DeviceInfo) => Promise<void>;
  register: (
    formData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      birthday: string;
    },
    deviceInfo: DeviceInfo,
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
  getCsrf: () => Promise<void>;
  ensureCsrf: () => Promise<void>;
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add session initialization helper
  const initializeSession = async (): Promise<void> => {
    try {
      // Make a simple request to initialize session before fetching CSRF
      await fetch(`${api_link}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Session initialization request failed:', err);
    }
  };

  // Update getCsrf function
  const getCsrf = async () => {
    try {
      // Ensure session exists first
      await initializeSession();
      
      const response = await fetch(`${api_link}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      }
    } catch (err) {
      console.error('CSRF fetch error:', err);
    }
  };

  // Update ensureCsrf to add retry logic
  const ensureCsrf = async () => {
  
  const token = await getCsrf();
  
    if (!csrfToken) {
      await getCsrf();
    }
    
    // Verify token was actually set
    if (!csrfToken) {
      console.error('Failed to obtain CSRF token');
      throw new Error('CSRF token unavailable');
    }
    
    // Small delay for cookie propagation
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  // Setup automatic token refresh (every 50 minutes, as per backend example)
  useEffect(() => {
    const setupTokenRefresh = (): void => {
      intervalRef.current = setInterval(async (): Promise<void> => {
        if (!user) return;
        let retries = 2; // Allow up to 2 retries
        while (retries >= 0) {
          try {
            const response: Response = await fetch(`${api_link}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });
            if (!response.ok) throw new Error('Refresh failed');
            const data = await response.json();
            if (data.csrfToken) setCsrfToken(data.csrfToken);
            break; // Success, exit retry loop
          } catch (error) {
            console.error(`Token refresh failed (retries left: ${retries}):`, error);
            retries--;
            if (retries < 0) {
              // Only log out after all retries fail
              setUser(null);
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
              }
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
          }
        }
      }, 50 * 60 * 1000); // 50 minutes
    };

    if (user) {
      setupTokenRefresh();
    }

    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, api_link]); // Depend on user to start/stop refresh

  useEffect(() => {
    const initAuth = async () => {
      // Always fetch CSRF early so auth pages can POST safely
      await getCsrf();
      await checkAuth();
    };
    initAuth();
  }, []);

  const checkAuth = async (retries = 1): Promise<void> => {
    try {
      const response = await fetch(`${api_link}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken }),
        },
      });
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else if (response.status === 403) {
        await getCsrf(); // Retry CSRF
        if (retries > 0) await checkAuth(retries - 1);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkAuth(retries - 1);
      } else {
        setError(handleFetchError(err, 'Authentication check failed'));
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update login to log more details in production
  const login = async (identifier: string, password: string, deviceInfo: DeviceInfo) => {
    try {
      setLoading(true);
      setError(null);
      await ensureCsrf();


      const response = await fetch(`${api_link}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken }),
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
          console.error('CSRF validation failed, fetching new token');
          await getCsrf();
        }
        throw new Error(data.message || 'Login failed');
      }
      
      setUser(data.user);
      setCsrfToken(data.csrfToken || null);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastLoginMethod', 'email');
      }
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
    deviceInfo: DeviceInfo,
    redirect?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      await ensureCsrf();

      const registerDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        birthday: formData.birthday,
      };

      const response = await fetch(`${api_link}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken }),
        },
        body: JSON.stringify({
          ...registerDto,
          deviceInfo,
          redirect: redirect ?? null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendMessage = data?.message;
        setError(backendMessage || 'Registration failed');
        throw new Error(backendMessage || 'Registration failed');
      }

      setCsrfToken(data.csrfToken || null);
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
    // Backend expects GET /auth/verify-email?token=...
    const response = await fetch(`${api_link}/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Email verification failed');
  };

  const sendResetPasswordOtp = async (email: string) => {
    await ensureCsrf();
    const response = await fetch(`${api_link}/auth/forgot-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'x-csrf-token': csrfToken }),
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to send reset OTP');
  };

  const verifyResetOtp = async (otp: string) => {
    await ensureCsrf();
    const response = await fetch(`${api_link}/auth/verify-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'x-csrf-token': csrfToken }),
      },
      body: JSON.stringify({ otp }),
    });
    if (!response.ok) throw new Error('Invalid OTP');
  };

  const resetPassword = async (
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    await ensureCsrf();
    const response = await fetch(`${api_link}/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'x-csrf-token': csrfToken }),
      },
      body: JSON.stringify({ otp, newPassword, confirmPassword }),
    });
    if (!response.ok) throw new Error('Password reset failed');
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    await ensureCsrf();
    const response = await fetch(`${api_link}/auth/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'x-csrf-token': csrfToken }),
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.message === 'Email available';
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await ensureCsrf();
      const response = await fetch(`${api_link}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'x-csrf-token': csrfToken }),
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lastLoginMethod');
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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
        ensureCsrf,
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
