'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessKey = params.get('access_key');
    if (accessKey) {
      // Save the token under a secure key in session storage.
      sessionStorage.setItem('sggtx', accessKey);
      // Optionally, remove the query string by redirecting.
      router.push('/');
    } else {
      router.push('/login');
    }
  }, [router]);

  return <div>Loading...</div>;
}
