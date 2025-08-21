// app/auth/verify-email/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const redirectQuery = searchParams.get('redirect');
  const router = useRouter();
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const api_link = process.env.NEXT_PUBLIC_API_URL;
  const hasVerified = useRef(false); // Prevent duplicate requests

  const isValidRedirectUrl = (url?: string) => {
    if (!url) return false;
    if (url.startsWith('/')) return true;
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        process.env.NEXT_PUBLIC_FRONTEND_A_URL,
        process.env.NEXT_PUBLIC_FRONTEND_B_URL,
        process.env.NEXT_PUBLIC_MAIN_URL,
      ].filter(Boolean);
      return allowedDomains.some(domain => parsedUrl.origin.includes(domain as string));
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!token) {
      setError('No token provided.');
      setIsLoading(false);
      return;
    }

    // Prevent duplicate verification attempts
    if (hasVerified.current) {
      return;
    }

    const verifyEmail = async () => {
      hasVerified.current = true;
      
      try {
        setIsLoading(true);
        const res = await fetch(`${api_link}/auth/verify-email?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setMessage('Email verified successfully! You can now log in.');
          setError('');

          // Always route the user to the login page and pass the original redirect (if valid)
          // so the login page can perform the final redirect after successful sign-in.
          const chosenRedirect = isValidRedirectUrl(redirectQuery || undefined) ? redirectQuery : null;
          const params = new URLSearchParams();
          if (chosenRedirect) params.set('redirect', chosenRedirect);
          params.set('verified', 'true');
          // short delay so user sees the success message, then go to login with redirect param
          setTimeout(() => {
            router.push(`/auth/login?${params.toString()}`);
          }, 2000);
         } else {
           setError(data.message || 'Verification failed.');
           setMessage(''); // Clear any previous messages
         }
      } catch (err: unknown) {
        console.error('Verification error:', err);
        setError('Server error during verification.');
        setMessage(''); // Clear any previous messages
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router, api_link]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Email Verification
          </h1>
          
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Verifying...</span>
            </div>
          )}
          
          {message && (
            <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-800/10 dark:text-green-400">
              {message}
            </div>
          )}
          
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-800/10 dark:text-red-400">
              {error}
            </div>
          )}
          
          {!isLoading && !message && !error && (
            <p className="text-gray-600 dark:text-gray-400">Processing verification...</p>
          )}
        </div>
      </div>
    </div>
  );
}
