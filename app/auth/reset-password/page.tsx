'use client';

import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import BlobAnimation from "@/components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPasswordPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token from URL query string
  const token = searchParams.get('token') || '';
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      return;
    }
    const validateToken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        setIsTokenValid(data.valid);
        if (!data.valid) {
          toast.error('Invalid or expired reset link.');
        }
      } catch  { // eslint-disable-line no-unused-vars
        setIsTokenValid(false);
        toast.error('Connection error. Please check your internet connection or try again later.');
      }
    };
    validateToken();
  }, [token]);

  // Step: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsResetLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password has been reset successfully.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch {
      toast.error('Connection error. Please check your internet connection or try again later.');
    }
    setIsResetLoading(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800"
    >
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
        <div className='max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box]  rounded-2xl border border-1.5 border-transparent animate-border'>
          <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Reset Password</h1>
          {isTokenValid === null && (
            <div className="text-center text-gray-600 dark:text-gray-300">
              <LoadingDots /> Validating reset link...
            </div>
          )}
          {isTokenValid === false && (
            <div className="text-center text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-4 py-2 rounded">
              Invalid or expired reset link. Please request a new password reset.
            </div>
          )}
          {isTokenValid === true && (
            <form onSubmit={handleResetPassword}>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Enter your new password below.
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <button
                type="submit"
                disabled={!newPassword || !confirmPassword || isResetLoading}
                className={`w-full h-10 p-2 rounded-xl text-white ${
                  isResetLoading 
                    ? "bg-blue-600 pointer-events-none" 
                    : (!newPassword || !confirmPassword 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700")
                }`}
              >
                {isResetLoading ? <LoadingDots /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}