'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Set new password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'OTP verified. Please enter your new password.');
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error');
      console.error(err);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reset-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Password has been reset successfully.');
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error');
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        {message && <p className="text-green-500 mb-2">{message}</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleVerifyOtp}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
              Verify OTP
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
              className="w-full p-2 border rounded mb-4"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
