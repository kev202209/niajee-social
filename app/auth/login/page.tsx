'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from 'next/navigation';
import BlobAnimation from "@/components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDeviceInfo } from "../../../utils/deviceInfo";
import { useAuth, type LoginResult } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null);
  const [step, setStep] = useState<'credentials' | 'device-otp'>('credentials');
  const [otp, setOtp] = useState('');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [tempAccessToken, setTempAccessToken] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const api_link = process.env.NEXT_PUBLIC_API_URL;
  const redirectUrl = searchParams.get('redirect');
  const { login, deviceVerifyOtp, deviceRequestOtp } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const method = localStorage.getItem('lastLoginMethod');
      setLastLoginMethod(method);
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    try {
      const deviceInfo = await getDeviceInfo();
      const result: LoginResult = await login(identifier, password, deviceInfo);

      if (result.requiresDeviceVerification) {
        setDeviceId(result.deviceId);
        setTempAccessToken(result.tempAccessToken);
        setStep('device-otp');
        toast.info('We sent a verification code to your email.');
        return;
      }

      toast.success('Login successful!');
      redirectAfterLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg === 'Wrong Email or Password.') {
        toast.error('Wrong Email or Password.');
      } else if (msg.includes('verify your email')) {
        toast.error('Please verify your email before logging in. Check your inbox for a verification code.');
      } else {
        toast.error('Something went wrong, try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleUrl = redirectUrl
      ? `${api_link}/auth/google?redirect=${encodeURIComponent(redirectUrl)}`
      : `${api_link}/auth/google`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastLoginMethod', 'google');
    }
    window.location.href = googleUrl;
  };

  const submitOtp = async () => {
    if (!deviceId || !tempAccessToken || !otp) {
      toast.error('Missing verification data');
      return;
    }
    setIsOtpSubmitting(true);
    try {
      await deviceVerifyOtp(tempAccessToken, deviceId, otp);
      toast.success('Device verified. Login successful!');
      redirectAfterLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      toast.error(msg);
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (!deviceId || !tempAccessToken) return;
    if (resendCooldown > 0) return;
    try {
      await deviceRequestOtp(tempAccessToken, deviceId);
      toast.success('A new code was sent to your email.');
      setResendCooldown(60);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend code';
      toast.error(msg);
    }
  };

  const redirectAfterLogin = () => {
    if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
      window.location.href = redirectUrl;
    } else {
      router.push('/');
    }
  };

  const isValidRedirectUrl = (url: string): boolean => {
    if (!url) return false;
    if (url.startsWith('/')) return true;
    try {
      const parsedUrl = new URL(url);
      const allowedOrigins = [process.env.NEXT_PUBLIC_FRONTEND_A_URL, process.env.NEXT_PUBLIC_FRONTEND_B_URL]
        .filter(Boolean) as string[];
      return allowedOrigins.some(origin => parsedUrl.origin === origin);
    } catch {
      return false;
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
      <BlobAnimation />
      <ToastContainer
        toastClassName={() =>
          "relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg"
        }
        closeButton={false}
        autoClose={3000}
        hideProgressBar={true}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit} className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
          <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Login</h1>
          <Link
            href={`/auth/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="block text-blue-600 dark:text-white mt-2 pb-2"
          >
            Don&apos;t have an account? <span className="font-bold">Sign Up</span>
          </Link>

          {lastLoginMethod && (
            <div className="hidden mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Last used: {lastLoginMethod === 'email' ? 'Email/Password' : 'Google'}
            </div>
          )}

          {step === 'credentials' && (
            <>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                name="identifier"
                required
                placeholder="Enter your email or username"
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full p-2 pr-10 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl mb-4 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingDots /> : "Login"}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300" />
                <span className="mx-2 text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300" />
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full p-2 dark:bg-sky-500/10 bg-sky-300 hover:bg-sky-400/80 text-white dark:hover:bg-sky-500/80 dark:text-white rounded-xl flex items-center justify-center gap-2"
                >
                  <FcGoogle className="text-2xl"/> Login with Google
                </button>
                <Link
                  href="/auth/forget-password"
                  className="w-full p-2 text-blue-600 dark:text-white flex items-center justify-center gap-2"
                >
                  Forgot Password
                </Link>
              </div>
            </>
          )}

          {step === 'device-otp' && (
            <>
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                We detected a login from a new device. Enter the 6‑digit code sent to your email.
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 tracking-widest text-center"
              />

              <button
                type="button"
                onClick={submitOtp}
                disabled={isOtpSubmitting || otp.length !== 6}
                className="w-full h-10 rounded-xl mb-3 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isOtpSubmitting ? <LoadingDots /> : "Verify Device"}
              </button>

              <button
                type="button"
                onClick={resendOtp}
                disabled={resendCooldown > 0}
                className="w-full h-10 rounded-xl flex justify-center items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); }}
                className="w-full mt-3 text-sm text-blue-600 dark:text-blue-300 underline"
              >
                Back to login
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}