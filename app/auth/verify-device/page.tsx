'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import BlobAnimation from "@/components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/contexts/AuthContext";  // Already imported, but ensure it's used

interface DeviceVerificationResponse {
  success: boolean;
  message: string;
  user?: unknown;
}

export default function VerifyDevicePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isTrusting, setIsTrusting] = useState(false);
  const hasVerified = useRef(false);
  
  const api_link = process.env.NEXT_PUBLIC_API_URL;
  const { csrfToken, ensureCsrf } = useAuth();  // Add this to access CSRF

  // keep getAuthToken stable
  const getAuthToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] ||
        null
      );
    }
    return null;
  }, []);

  // stable verifyDevice so we can safely include it in effect deps & call it elsewhere
  const verifyDevice = useCallback(async (deviceToken: string) => {
    if (hasVerified.current) return;
    hasVerified.current = true;
    setIsVerifying(true);
    try {
      await ensureCsrf();  // Ensure CSRF token is available
      const authToken = getAuthToken();
      const response = await fetch(`${api_link}/auth/devices/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...(csrfToken && { 'x-csrf-token': csrfToken }),  // Add CSRF header
        },
        credentials: 'include',
        body: JSON.stringify({ deviceToken })
      });

      const data: DeviceVerificationResponse = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message || 'Device verified successfully!');
        toast.success('Device verified successfully!');
        setTimeout(() => router.push('/'), 3000);
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Device verification failed');
        toast.error(data.message || 'Device verification failed');
      }
    } catch (error) {
      console.error('Device verification error:', error);
      setVerificationStatus('error');
      setMessage('Network error during device verification');
      toast.error('Network error during device verification');
    } finally {
      setIsVerifying(false);
    }
  }, [api_link, getAuthToken, csrfToken, ensureCsrf, router]);

  useEffect(() => {
    if (token && !hasVerified.current) {
      verifyDevice(token);
    }
  }, [token, verifyDevice]);

  const handleTrustDevice = async () => {
    if (!token) return;

    setIsTrusting(true);
    try {
      await ensureCsrf();  // Ensure CSRF token
      const authToken = getAuthToken();
      const response = await fetch(`${api_link}/auth/devices/trust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...(csrfToken && { 'x-csrf-token': csrfToken }),  // Add CSRF header
        },
        credentials: 'include',
        body: JSON.stringify({ deviceId: token })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Device trusted successfully!');
        router.push('/');
      } else {
        toast.error(data.message || 'Failed to trust device');
      }
    } catch (error) {
      console.error('Trust device error:', error);
      toast.error('An error occurred while trusting device');
    } finally {
      setIsTrusting(false);
    }
  };

  const handleDenyDevice = () => {
    toast.success('Device access denied. Please contact support if this wasn&apos;t you.');
    router.push('/auth/login');
  };

  const handleRetryVerification = () => {
    if (token) {
      hasVerified.current = false;
      setVerificationStatus('idle');
      setMessage('');
      verifyDevice(token);
    }
  };

  // Render invalid token state
  if (!token) {
    return (
      <div className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
        <BlobAnimation />
        <ToastContainer
          toastClassName={() =>
            "relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg"
          }
          closeButton={false}
          autoClose={3000}
          hideProgressBar={true}
        />

        <div className=" relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
            
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
                Invalid Verification Link
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This device verification link is invalid or has expired.
              </p>
              <Link
                href="/auth/login"
                className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-center transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
      <BlobAnimation />
      <ToastContainer
        toastClassName={() =>
          "relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg"
        }
        closeButton={false}
        autoClose={3000}
        hideProgressBar={true}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-16">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
          
          <div className="text-center">
            {/* Header with dynamic emoji */}
            <div className="mb-6">
              <div className="text-6xl mb-4">
                {isVerifying && '⏳'}
                {verificationStatus === 'success' && '✅'}
                {verificationStatus === 'error' && '❌'}
                {verificationStatus === 'idle' && !isVerifying && '🔐'}
              </div>
              <h1 className="text-2xl font-bold mb-2 text-blue-600 dark:text-white">
                Device Verification
              </h1>
            </div>

            {/* Loading State */}
            {isVerifying && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <LoadingDots />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Verifying your device...</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Please wait while we verify your device.</p>
              </div>
            )}

            {/* Success State */}
            {verificationStatus === 'success' && (
              <div className="text-center">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                  <p className="text-green-800 dark:text-green-300 font-medium">{message}</p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your device has been successfully verified. You will be redirected shortly.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleTrustDevice}
                    disabled={isTrusting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isTrusting ? <LoadingDots /> : '✅ Trust This Device'}
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition-colors"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {verificationStatus === 'error' && (
              <div className="text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                  <p className="text-red-800 dark:text-red-300 font-medium">{message}</p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  If this wasn&apos;t you, please secure your account immediately.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleRetryVerification}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleDenyDevice}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl transition-colors"
                  >
                    ❌ This Wasn&apos;t Me
                  </button>
                  <Link
                    href="/auth/login"
                    className="w-full inline-block bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {/* Idle State - Manual Verification */}
            {verificationStatus === 'idle' && !isVerifying && (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We detected a login from a new device. Please verify that this was you.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong>Security Notice:</strong> Only verify this device if you recognize the login attempt.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => verifyDevice(token)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl transition-colors font-medium"
                  >
                    ✅ Yes, This Was Me
                  </button>
                  <button
                    onClick={handleDenyDevice}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl transition-colors"
                  >
                    ❌ This Wasn&apos;t Me
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                🔒 Niajee Social Security
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                This verification helps protect your account from unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}