'use client';

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import BlobAnimation from "@/components/Blob";
import LoadingDots from "@/components/LoadingDots";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { getDeviceInfo } from '../../utils/deviceInfo';
import { DatePicker } from "@/components/ui/DatePicker";
import { differenceInYears, parseISO } from "date-fns";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const { register, checkEmailAvailability } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: '',
  });
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [birthdayError, setBirthdayError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

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
        process.env.NEXT_PUBLIC_MAIN_URL,
      ].filter(Boolean);
      return allowedDomains.some(domain => 
        parsedUrl.origin.includes(domain as string)
      );
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "confirmPassword" || name === "password") {
      if (
        (name === "confirmPassword" && value !== formData.password) ||
        (name === "password" && formData.confirmPassword && value !== formData.confirmPassword)
      ) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError(null);
      }
    }
  };

  const handleEmailCheck = async () => {
    setIsEmailLoading(true);
    try {
      const isAvailable = await checkEmailAvailability(formData.email);
      if (isAvailable) {
        setStep(2);
        toast.success("Email is available! Let's continue.");
      } else {
        toast.error('Email is already registered');
      }
    } catch (err) {
      toast.error('Failed to check email availability');
      console.error(err);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (!isOldEnough(formData.birthday)) {
      toast.error("You must be at least 13 years old to register.");
      return;
    }
    setIsRegisterLoading(true);
    try {
      const deviceInfo = await getDeviceInfo();
      await register(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          birthday: formData.birthday,
          // username/profilePic will be auto-generated on backend
        },
        deviceInfo
      );
      // move to verification step
      setStep(4);
      toast.success("Registration successful! Please check your email for verification.");
      if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
        sessionStorage.setItem('postVerificationRedirect', redirectUrl);
      }
    } catch (err) {
      // Do NOT show raw server error to users. Log it and show a generic message.
      console.error('Registration error:', err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const googleUrl = redirectUrl 
      ? `${api_link}/auth/google?redirect=${encodeURIComponent(redirectUrl)}`
      : `${api_link}/auth/google`;
    window.location.href = googleUrl;
  };

  // Helper to check age
  const isOldEnough = (birthday: string) => {
    if (!birthday) return false;
    const age = differenceInYears(new Date(), parseISO(birthday));
    return age >= 13;
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
        autoClose={7000}
        hideProgressBar={true}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box]  rounded-2xl border border-1.5 border-transparent animate-border">
          
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-blue-500 dark:text-white">
                Welcome to Niajee
              </h1>
              <Link 
                href={`/auth/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} 
                className="block text-blue-600 dark:text-white mt-2 pb-2"
              >
                Already have an account? <span className="font-bold">Login</span>
              </Link>
              <div className="flex flex-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-3 mr-1.5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={handleEmailCheck}
                disabled={!formData.firstName || !formData.lastName || !formData.email || isEmailLoading}
                className={`w-full h-10 p-2 rounded-xl mb-3 text-white ${
                  isEmailLoading 
                    ? "bg-blue-600 pointer-events-none" 
                    : (!formData.firstName || !formData.lastName || !formData.email 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer")
                }`}
              >
                {isEmailLoading ? <LoadingDots /> : "Continue"}
              </button>
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={handleGoogleSignup}
                  className="w-full p-2 dark:bg-sky-500/10 bg-sky-600 hover:bg-sky-500/80 text-white dark:hover:bg-sky-500/80 dark:text-white rounded-xl flex items-center justify-center gap-2"
                >
                  <FaGoogle /> Sign up with Google
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">
                Your Details
              </h1>
              <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">
                Birthday <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.birthday}
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, birthday: date }));
                  if (date && !isOldEnough(date)) {
                    setBirthdayError("You must be at least 13 years old to register.");
                  } else {
                    setBirthdayError(null);
                  }
                }}
                placeholder="Select your birthday"
                className="mb-3"
              />
              {birthdayError && (
                <p className="text-red-500 text-xs mb-2">{birthdayError}</p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Please enter your real birthday. If you lie, some features may not be available to you.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>
                  <b>Note:</b> You can personalize your username and profile picture after signing up!
                </span>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={
                    !formData.birthday ||
                    !!birthdayError ||
                    !isOldEnough(formData.birthday)
                  }
                  className={`p-2 h-10 rounded text-white ${
                    !formData.birthday ||
                    !!birthdayError ||
                    !isOldEnough(formData.birthday)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">
                Set up Password
              </h1>
              <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 pr-10 border rounded mb-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-2 pr-10 border rounded mb-1 bg-white dark:bg-gray-700 ${
                    passwordError
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  } text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mb-2">{passwordError}</p>
              )}

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                By creating an account, you confirm that you have read and accept our{" "}
                <a href={`${process.env.NEXT_PUBLIC_MAIN_URL}/terms`} className="text-blue-500 underline hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                  Terms and Conditions
                </a>.
              </p>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={
                    !formData.password ||
                    !formData.confirmPassword ||
                    !!passwordError ||
                    isRegisterLoading
                  }
                  className={`p-2 h-10 rounded text-white ${
                    isRegisterLoading 
                      ? "bg-blue-600 pointer-events-none" 
                      : (!formData.password || !formData.confirmPassword || !!passwordError
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-blue-600 hover:bg-blue-700 cursor-pointer")
                  }`}
                >
                  {isRegisterLoading ? <LoadingDots /> : "Continue"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold mb-4 text-blue-500 dark:text-white">Verify Your Email</h1>
              <p className="text-blue-500 dark:text-white">Registration successful! Please check your email for verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
