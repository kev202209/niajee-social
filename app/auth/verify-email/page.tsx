// app/auth/verify-email/page.tsx
'use client'
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        // Call your backend verification endpoint.
        const res = await fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setMessage('Email verified successfully! You can now log in.');
          // Optionally, redirect after a delay:
          setTimeout(() => router.push('/auth/login'), 5000);
        } else {
          setError(data.message || 'Verification failed.');
        }
      } catch (err) {
        setError('Server error during verification.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
