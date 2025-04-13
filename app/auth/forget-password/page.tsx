'use client';

import React, { useState } from "react";
import BlobAnimation from "@/components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CosmicPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      // Log raw response for debugging.
      console.log("Raw response:", text);
      const data = JSON.parse(text);
      if (res.ok) {
        setMessage(data.message);
        toast.success(data.message);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (err) {
      setError('Connection error.Please check your internet connection or try again later.');
      toast.error('Connection error.Please check your internet connection or try again later.');
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
      {/* Use the BlobAnimation component for the background */}
      <BlobAnimation />
      
      {/* Toast Notifications */}
      <ToastContainer
        toastClassName={() =>
          "relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg"
        }
        // bodyClassName="text-base font-semibold"
        closeButton={false}
        autoClose={7000}
        hideProgressBar={true}
      />

      
      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box]  rounded-2xl border border-1.5 border-transparent animate-border">
          
          <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Forgot Password</h1>
          {/* {message && <p className="text-green-500 mb-2">{message}</p>} */}
          {/* {error && <p className="text-red-500 mb-2">{error}</p>} */}
          <p className="mb-4 text-sm text-blue-600 dark:text-white">
            Enter your email to receive a one-time password (OTP) to reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mb-4 dark:bg-inherit"
              required
            />
            <button
              type="submit"
              disabled={!email || isLoading}
              className={`w-full h-10 p-2 rounded-xl text-white ${
                isLoading
                  ? "bg-blue-600 pointer-events-none"
                  : (!email ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")
              }`}
            >
              {isLoading ? <LoadingDots /> : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
