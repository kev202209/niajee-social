'use client';

import React, { useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import BlobAnimation from "@/components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPasswordPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Set new password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Step 1: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsOtpLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'OTP verified. Please enter your new password.');
        toast.success(data.message || 'OTP verified. Please enter your new password.');
        setStep(2);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (err) {
      setError('Connection error.Please check your internet connection or try again later.');
      toast.error('Connection error.Please check your internet connection or try again later.');
      console.error(err);
    }
    setIsOtpLoading(false);
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    setIsResetLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reset-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Password has been reset successfully.');
        toast.success(data.message || 'Password has been reset successfully.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (err) {
      setError('Connection error.Please check your internet connection or try again later.');
      toast.error('Connection error.Please check your internet connection or try again later.');
      console.error(err);
    }
    setIsResetLoading(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800"
    >
      {/* Use the BlobAnimation component for the background */}
      <BlobAnimation />
      
      {/* Toast Notifications */}
      <ToastContainer
        toastClassName="!bg-blue-600 !text-white !rounded-md !shadow-md"
        // bodyClassName="!text-white"
        progressClassName="!bg-blue-300"
        autoClose={3000}
      />
      
      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className='max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box]  rounded-2xl border border-1.5 border-transparent animate-border'>
          
          <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Reset Password</h1>
          {/* {message && <p className="text-green-500 mb-2">{message}</p>} */}
          {/* {error && <p className="text-red-500 mb-2">{error}</p>} */}

          {step === 1 && (
            <form onSubmit={handleVerifyOtp}>
              <label className="block text-sm font-medium text-gray-500 mb-1">Enter OTP</label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded mb-4 dark:bg-inherit"
                required
              />
              <button
                type="submit"
                disabled={!otp || isOtpLoading}
                className={`w-full h-10 p-2 rounded-xl text-white ${
                  isOtpLoading 
                    ? "bg-blue-600 pointer-events-none" 
                    : (!otp ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")
                }`}
              >
                {isOtpLoading ? <LoadingDots /> : "Verify OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4 dark:bg-inherit"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded mb-4 dark:bg-inherit"
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
