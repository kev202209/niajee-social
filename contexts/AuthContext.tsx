'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@/types';
import { DeviceInfo } from '@/utils/deviceInfo'; 

export type LoginResult =
  | { requiresDeviceVerification: true; deviceId: string; tempAccessToken: string }
  | { requiresDeviceVerification: false };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string, deviceInfo: DeviceInfo) => Promise<LoginResult>;
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
  verifyResetOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  // Token-based reset (magic-link style)
  validateResetToken: (token: string) => Promise<boolean>;
  resetPasswordWithToken: (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  csrfToken: string | null;
  setCsrfToken: (token: string | null) => void;
  getCsrf: () => Promise<string | null>;
  ensureCsrf: () => Promise<string>;
  checkAuth: () => Promise<void>;
  deviceVerifyOtp: (tempAccessToken: string, deviceId: string, otp: string) => Promise<void>;
  deviceRequestOtp: (tempAccessToken: string, deviceId: string) => Promise<void>;
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
  const getCsrf = async (): Promise<string | null> => {
    try {
      // Ensure session exists first
      await initializeSession();
      
      const response = await fetch(`${api_link}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const token = (data?.csrfToken ?? null) as string | null;
        if (token) {
          setCsrfToken(token);
          return token;
        }
      }
    } catch (err) {
      console.error('CSRF fetch error:', err);
    }
    return null;
  };

  // Update ensureCsrf to add retry logic
  const ensureCsrf = async (): Promise<string> => {
    if (csrfToken) return csrfToken;
    const token = await getCsrf();
    if (token) return token;
    // brief retry for state propagation
    await new Promise((r) => setTimeout(r, 100));
    if (csrfToken) return csrfToken;
    console.error('Failed to obtain CSRF token');
    throw new Error('CSRF token unavailable');
  };

  // Add: refresh access token with CSRF
  const refreshAccessToken = async (): Promise<void> => {
    const csrf = await ensureCsrf();
    const response = await fetch(`${api_link}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
      },
    });
    if (!response.ok) {
      throw new Error('Refresh failed');
    }
    const data = await response.json().catch(() => ({} as { csrfToken?: string }));
    if (data.csrfToken) setCsrfToken(data.csrfToken);
  };

  // Setup automatic token refresh (run more frequently)
  useEffect(() => {
    const setupTokenRefresh = (): void => {
      // refresh every 10 minutes as a baseline; on-demand refresh also exists in checkAuth
      intervalRef.current = setInterval(async (): Promise<void> => {
        if (!user) return;
        let retries = 2;
        while (retries >= 0) {
          try {
            await refreshAccessToken();
            break;
          } catch (error) {
            console.error(`Token refresh failed (retries left: ${retries}):`, error);
            retries--;
            if (retries < 0) {
              setUser(null);
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
              }
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000));
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
      } else if (response.status === 401) {
        // Access token likely expired: try refresh then retry verify once
        try {
          await refreshAccessToken();
          const retryRes = await fetch(`${api_link}/auth/verify`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(csrfToken && { 'x-csrf-token': csrfToken }),
            },
          });
          if (retryRes.ok) {
            const userData: User = await retryRes.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else if (response.status === 403) {
        await getCsrf();
        if (retries > 0) await checkAuth(retries - 1);
        else setUser(null);
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
  const login = async (
    identifier: string,
    password: string,
    deviceInfo: DeviceInfo
  ): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);
      const csrf = await ensureCsrf();

      const response = await fetch(`${api_link}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({
          loginDto: { identifier, password },
          deviceInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          console.error('CSRF validation failed, fetching new token');
          await getCsrf();
        }
        throw new Error((data as { message?: string })?.message || 'Login failed');
      }

      // Device verification required
      if (
        (data as { requiresDeviceVerification?: boolean }).requiresDeviceVerification &&
        (data as { deviceId?: string }).deviceId &&
        (data as { tempAccessToken?: string }).tempAccessToken
      ) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastLoginMethod', 'email');
        }
        return {
          requiresDeviceVerification: true,
          deviceId: (data as { deviceId: string }).deviceId,
          tempAccessToken: (data as { tempAccessToken: string }).tempAccessToken,
        };
      }

      // Normal login path: cookies already set by server
      await checkAuth(); // populate user from /auth/verify
      setCsrfToken((data as { csrfToken?: string })?.csrfToken || csrfToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastLoginMethod', 'email');
      }
      return { requiresDeviceVerification: false };
    } catch (err) {
      const errorMessage = handleFetchError(err, 'Login failed');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deviceVerifyOtp = async (
    tempAccessToken: string,
    deviceId: string,
    otp: string
  ): Promise<void> => {
    const csrf = await ensureCsrf();
    const res = await fetch(`${api_link}/auth/devices/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
        Authorization: `Bearer ${tempAccessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ deviceId, otp }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) throw new Error((data as { message?: string })?.message || 'Verification failed');

    // On success, cookies are set; load user
    await checkAuth();
  };

  const deviceRequestOtp = async (
    tempAccessToken: string,
    deviceId: string
  ): Promise<void> => {
    const csrf = await ensureCsrf();
    const res = await fetch(`${api_link}/auth/devices/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
        Authorization: `Bearer ${tempAccessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ deviceId }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) throw new Error((data as { message?: string })?.message || 'Failed to resend code');
  };

  // Use the token returned by ensureCsrf for all requests below

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
      const csrf = await ensureCsrf();

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
          'x-csrf-token': csrf,
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
    const csrf = await ensureCsrf();
    const response = await fetch(`${api_link}/auth/forgot-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to send reset OTP');
  };

  const verifyResetOtp = async (email: string, otp: string): Promise<void> => {
    const csrf = await ensureCsrf();
    const res = await fetch(`${api_link}/auth/verify-reset-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
      },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { message?: string }).message || 'Invalid or expired code.');
    }
  };

  const resetPassword = async (
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    const csrf = await ensureCsrf();
    const response = await fetch(`${api_link}/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
      },
      body: JSON.stringify({ otp, newPassword, confirmPassword }),
    });
    if (!response.ok) throw new Error('Password reset failed');
  };

  // Validate reset token (GET). CSRF usually not required for GET, but include credentials for cookies.
  const validateResetToken = async (token: string): Promise<boolean> => {
    const response = await fetch(`${api_link}/auth/validate-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return false;
    try {
      const data = await response.json();
      return Boolean((data as { valid?: boolean }).valid);
    } catch {
      return false;
    }
  };

  // Token-based reset password (POST) with CSRF
  const resetPasswordWithToken = async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    const csrf = await ensureCsrf();
    const response = await fetch(`${api_link}/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
      },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
    if (!response.ok) {
      let msg = 'Password reset failed';
      try {
        const data = await response.json();
        if ((data as { message?: string }).message) msg = (data as { message: string }).message;
      } catch { /* ignore */ }
      throw new Error(msg);
    }
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    const csrf = await ensureCsrf();
    const response = await fetch(`${api_link}/auth/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrf,
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
      const csrf = await ensureCsrf();
      const response = await fetch(`${api_link}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
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
        validateResetToken,
        resetPasswordWithToken,
        checkEmailAvailability,
        csrfToken,
        setCsrfToken,
        getCsrf,
        ensureCsrf,
        checkAuth,
        deviceVerifyOtp,
        deviceRequestOtp,
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
