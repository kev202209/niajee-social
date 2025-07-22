// app/auth/verify-email/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const api_link = process.env.NEXT_PUBLIC_API_URL;
  const hasVerified = useRef(false); // Prevent duplicate requests

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
          
          // Check for stored redirect URL
          const storedRedirect = sessionStorage.getItem('postVerificationRedirect');
          if (storedRedirect) {
            sessionStorage.removeItem('postVerificationRedirect');
            setTimeout(() => {
              window.location.href = `${storedRedirect}?verified=true`;
            }, 2000);
          } else {
            setTimeout(() => router.push('/auth/login'), 5000);
          }
        } else {
          setError(data.message || 'Verification failed.');
          setMessage(''); // Clear any previous messages
        }
      } catch (err) {
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
