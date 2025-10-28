'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BlobAnimation from '@/components/Blob';
import LoadingDots from '@/components/LoadingDots';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type Step = 'email' | 'otp' | 'new-password';

interface ApiMessage {
  message?: string;
}

const api = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ensureCsrf, verifyResetOtp } = useAuth();

  const initialEmail = searchParams.get('email') || '';
  const initialOtp = searchParams.get('otp') || '';

  const [step, setStep] = useState<Step>(() => {
    if (initialEmail && initialOtp) return 'new-password';
    if (initialEmail) return 'otp';
    return 'email';
  });

  const [email, setEmail] = useState<string>(initialEmail);
  const [otp, setOtp] = useState<string>(initialOtp);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const hasAutoAdvanced = useRef<boolean>(false);

  // NEW: password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validEmail = useMemo(() => /\S+@\S+\.\S+/, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const onSendCode = async () => {
    if (!api) return toast.error('API not configured.');
    if (!email || !validEmail.test(email)) {
      toast.error('Enter a valid email.');
      return;
    }
    setIsLoading(true);
    try {
      const csrf = await ensureCsrf();
      const res = await fetch(`${api}/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ email }),
      });
      const data: ApiMessage = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to send reset code.');
      }
      toast.success('If the email exists, a reset code has been sent.');
      setStep('otp');
      setResendCooldown(60);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send reset code.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (!api) return toast.error('API not configured.');
    if (!email || !validEmail.test(email) || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const csrf = await ensureCsrf();
      const res = await fetch(`${api}/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ email }),
      });
      const data: ApiMessage = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to resend code.');
      }
      toast.success('A new code was sent to your email.');
      setResendCooldown(60);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to resend code.';
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const verifyThenAdvance = useCallback(async () => {
    if (!email || otp.length !== 6) return;
    setIsVerifyingOtp(true);
    try {
      await verifyResetOtp(email, otp);
      toast.success('Code verified.');
      setStep('new-password');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid or expired code.';
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [email, otp, verifyResetOtp]);

  const handleOtpChange = useCallback((value: string) => {
    const numeric = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numeric);
    if (numeric.length === 6 && step === 'otp' && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      void verifyThenAdvance().finally(() => {
        setTimeout(() => {
          hasAutoAdvanced.current = false;
        }, 200);
      });
    }
  }, [step, verifyThenAdvance]);

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return toast.error('API not configured.');
    if (!email || !validEmail.test(email)) {
      toast.error('Enter a valid email.');
      setStep('email');
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error('Enter the 6-digit code sent to your email.');
      setStep('otp');
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error('Enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const csrf = await ensureCsrf();
      const res = await fetch(`${api}/auth/reset-password-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf,
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data: ApiMessage = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to reset password.');
      toast.success('Password has been reset successfully.');
      setTimeout(() => router.push('/auth/login'), 1200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to reset password.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
      <BlobAnimation />
      <ToastContainer
        toastClassName={() =>
          'relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg'
        }
        closeButton={false}
        autoClose={3000}
        hideProgressBar
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
          <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Reset Password</h1>

          {step === 'email' && (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Enter your email to receive a password reset code.
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={onSendCode}
                disabled={!email || !validEmail.test(email) || isLoading}
                className={`w-full h-10 rounded-xl flex items-center justify-center text-white ${
                  isLoading
                    ? 'bg-blue-600 pointer-events-none'
                    : (!email || !validEmail.test(email)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700')
                }`}
              >
                {isLoading ? <LoadingDots /> : 'Send Code'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Enter the 6-digit code sent to <span className="font-medium">{email}</span>.
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 tracking-widest text-center text-xl"
              />

              <button
                type="button"
                onClick={verifyThenAdvance}
                disabled={otp.length !== 6 || isVerifyingOtp}
                className="w-full h-10 rounded-xl mb-3 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isVerifyingOtp ? <LoadingDots /> : 'Continue'}
              </button>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Didn&apos;t get a code?{' '}
                <button
                  type="button"
                  onClick={onResend}
                  disabled={isResending || resendCooldown > 0 || isVerifyingOtp}
                  className={`underline ${
                    isResending || resendCooldown > 0 || isVerifyingOtp
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

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full mt-3 text-sm text-blue-600 dark:text-blue-300 underline"
              >
                Change email
              </button>
            </div>
          )}

          {step === 'new-password' && (
            <form onSubmit={onResetPassword}>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Set a new password for <span className="font-medium">{email}</span>.
              </p>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative mb-4">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 pr-10 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative mb-4">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 pr-10 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!email || otp.length !== 6 || !newPassword || !confirmPassword || isLoading}
                className={`w-full h-10 rounded-xl flex items-center justify-center text-white ${
                  isLoading
                    ? 'bg-blue-600 pointer-events-none'
                    : (!email || otp.length !== 6 || !newPassword || !confirmPassword
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700')
                }`}
              >
                {isLoading ? <LoadingDots /> : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep('otp')}
                className="w-full mt-3 text-sm text-blue-600 dark:text-blue-300 underline"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}