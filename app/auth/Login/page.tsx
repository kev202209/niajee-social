'use client';

import React, { useState } from "react";
import Link from "next/link";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter, useSearchParams } from 'next/navigation';
import BlobAnimation from "../../../components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { getDeviceInfo } from "../../utils/deviceInfo";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    try {
      const deviceInfo = await getDeviceInfo();
      await login(identifier, password, deviceInfo);
      toast.success("Login successful!");
      
      // Redirect to specified URL or default home
      if (redirectUrl) {
        // Validate the redirect URL for security
        if (isValidRedirectUrl(redirectUrl)) {
          window.location.href = redirectUrl;
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Include redirect URL in Google OAuth flow
    const googleUrl = redirectUrl 
      ? `${api_link}/auth/google?redirect=${encodeURIComponent(redirectUrl)}`
      : `${api_link}/auth/google`;
    window.location.href = googleUrl;
  };

  // Security function to validate redirect URLs
  const isValidRedirectUrl = (url: string): boolean => {
    if (!url) return false;
    // Allow same-origin relative paths
    if (url.startsWith('/')) return true;
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        process.env.NEXT_PUBLIC_FRONTEND_A_URL,
        process.env.NEXT_PUBLIC_FRONTEND_B_URL,
      ].filter(Boolean);
      return allowedDomains.some(domain => parsedUrl.origin.includes(domain as string));
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
        autoClose={7000}
        hideProgressBar={true}
      />


      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit} className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
          <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Login</h1>
          <Link 
            href={`/auth/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} 
            className="block text-blue-600 dark:text-white mt-2 pb-2"
          >
            Don&apos;t have an account? <span className="font-bold">Sign Up</span>
          </Link>

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

          {/* Centered OR divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          {/* OAuth Buttons with icons */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleGoogleLogin}
              className="w-full p-2 dark:bg-sky-500/10 bg-sky-600 hover:bg-sky-500/80 text-white dark:hover:bg-sky-500/80 dark:text-white rounded-xl flex items-center justify-center gap-2"
            >
              <FaGoogle /> Login with Google
            </button>
            <Link
              href="/auth/forget-password"
              className="w-full p-2 text-blue-600 dark:text-white flex items-center justify-center gap-2"
            >
              Forgot Password
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
