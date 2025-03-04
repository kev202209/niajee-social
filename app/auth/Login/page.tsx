'use client';

import React, { useState } from "react";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import BlobAnimation from "@/components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DeviceDetails {
  device: string;
  location: string;
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const deviceDetails: DeviceDetails = {
      device: navigator.userAgent,
      location: "Unknown",
    };

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, deviceDetails }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Login successful!");
        setError("");
        toast.success("Login successful!");
        window.location.href = "/";
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error(
        "It seems there was an issue with the login process. Please check your internet connection or try again later."
      );
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
      <BlobAnimation />
      <ToastContainer
        toastClassName="!bg-blue-600 !text-white !rounded-md !shadow-md"
        // bodyClassName="!text-white"
        progressClassName="!bg-blue-300"
        autoClose={10000}
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box]  rounded-2xl border border-1.5 border-transparent animate-border">
          <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Login</h1>
          <Link href="/auth/register" className="block text-blue-600 dark:text-white mt-2 pb-2">
            Don't have an account? <span className="font-bold">Sign Up</span>
          </Link>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {message && <p className="text-green-500 mb-2">{message}</p>}

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email or Username
          </label>
          <input
            type="text"
            placeholder="Enter your email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-2 border rounded mb-4 dark:bg-inherit text-black dark:text-white"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4 dark:bg-inherit text-black dark:text-white"
          />

          <button
            onClick={handleLogin}
            disabled={!identifier || !password || isLoading}
            className={`w-full h-10 rounded-xl mb-4 flex justify-center items-center ${
              identifier && password
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
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
        </div>
      </div>
    </div>
  );
}
