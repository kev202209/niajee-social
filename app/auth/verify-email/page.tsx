// app/auth/verify-email/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BlobAnimation from '@/components/Blob';
import { useAuth } from '@/contexts/AuthContext';

interface ApiMessage {
  message?: string;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ensureCsrf } = useAuth();

  const email = searchParams.get('email');
  const redirectQuery = searchParams.get('redirect') || undefined;
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const hasAutoSubmitted = useRef<boolean>(false);

  useEffect(() => {
    // Preload CSRF so first POST succeeds
    void ensureCsrf().catch(() => void 0);
  }, [ensureCsrf]);

  const isValidRedirectUrl = useCallback((url?: string) => {
    if (!url) return false;
    if (url.startsWith('/')) return true;
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        process.env.NEXT_PUBLIC_FRONTEND_A_URL,
        process.env.NEXT_PUBLIC_FRONTEND_B_URL,
        process.env.NEXT_PUBLIC_MAIN_URL,
      ].filter(Boolean);
      return allowedDomains.some(domain => parsedUrl.origin.includes(domain as string));
    } catch {
      return false;
    }
  }, []);

  const chosenRedirect = useMemo(() => {
    return isValidRedirectUrl(redirectQuery) ? redirectQuery : undefined;
  }, [redirectQuery, isValidRedirectUrl]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const verifyOtp = useCallback(async (code: string) => {
    if (!email || !api_link) return;
    setIsVerifying(true);
    setMessage('');
    setError('');
    try {
      const csrf = await ensureCsrf();

      const doPost = async (): Promise<Response> => {
        return fetch(`${api_link}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrf,
          },
          credentials: 'include',
          body: JSON.stringify({ email, otp: code }),
        });
      };

      let res = await doPost();
      if (res.status === 403) {
        // Fetch fresh CSRF and retry once
        const newCsrf = await ensureCsrf();
        res = await fetch(`${api_link}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': newCsrf,
          },
          credentials: 'include',
          body: JSON.stringify({ email, otp: code }),
        });
      }

      const data: ApiMessage = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage('Email verified successfully! You can now log in.');
        setError('');
        const params = new URLSearchParams();
        if (chosenRedirect) params.set('redirect', chosenRedirect);
        params.set('verified', 'true');
        setTimeout(() => {
          router.replace(`/auth/login?${params.toString()}`);
        }, 1200);
      } else {
        setError(data?.message || 'Invalid or expired OTP. Please try again.');
        setMessage('');
      }
    } catch (e) {
      console.error('OTP verification error:', e);
      setError('Server error during verification. Please try again.');
      setMessage('');
    } finally {
      setIsVerifying(false);
    }
  }, [api_link, chosenRedirect, email, router, ensureCsrf]);

  const handleOtpChange = (value: string) => {
    // Keep only digits, clamp length to 6
    const numeric = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numeric);
    setError(''); // clear error as user types

    // Auto-submit when full length is reached, once
    if (numeric.length === 6 && !isVerifying && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      void verifyOtp(numeric).finally(() => {
        // allow next auto-submit if user edits after a failure
        setTimeout(() => {
          hasAutoSubmitted.current = false;
        }, 300);
      });
    }
  };

  const resendOtp = async () => {
    if (!email || !api_link || resendCooldown > 0) return;
    setIsResending(true);
    setError('');
    setMessage('');
    try {
      const csrf = await ensureCsrf();

      const doPost = async (token: string): Promise<Response> => {
        return fetch(`${api_link}/auth/resend-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': token,
          },
          credentials: 'include',
          body: JSON.stringify({ email, redirect: chosenRedirect || '' }),
        });
      };

      let res = await doPost(csrf);
      if (res.status === 403) {
        const newCsrf = await ensureCsrf();
        res = await doPost(newCsrf);
      }

      const data: ApiMessage = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage(data?.message || 'A new OTP has been sent to your email.');
        setResendCooldown(60); // UI cooldown to prevent spamming (server is also throttled)
      } else {
        setError(data?.message || 'Failed to resend verification code.');
        // If server throttled, set a longer cooldown hint
        if (res.status === 429) setResendCooldown(120);
      }
    } catch (e) {
      console.error('Resend OTP error:', e);
      setError('Server error while resending OTP.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
        <BlobAnimation />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
            <h1 className="text-2xl font-bold mb-4 text-blue-500 dark:text-white">Email Verification</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Missing email. Please return to registration and try again.
            </p>
            <a
              href="/auth/register"
              className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Go to Register
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
      <BlobAnimation />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
          <h1 className="text-2xl font-bold mb-4 text-blue-500 dark:text-white">
            Verify your email
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter the 6-digit code sent to <span className="font-medium">{email}</span>
          </p>

          <div className="flex justify-center mb-4">
            <input
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              aria-label="One-time password"
              className="tracking-widest text-center text-xl w-48 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="••••••"
            />
          </div>

          {isVerifying && (
            <div className="flex items-center justify-center mb-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Verifying...</span>
            </div>
          )}

          {message && (
            <div className="p-3 mb-3 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-800/10 dark:text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 mb-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-800/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Didn&apos;t get a code?{' '}
            <button
              onClick={resendOtp}
              disabled={isResending || resendCooldown > 0}
              className={`underline ${
                isResending || resendCooldown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700 dark:text-blue-400'
              }`}
            >
              {isResending
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
