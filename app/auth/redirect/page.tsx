'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthRedirect() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const success = params.get('success');
      const error = params.get('error');

      if (error) {
        // On error, redirect to login
        router.push('/auth/login');
        return;
      }

      if (success === 'true') {
        try {
          // Verify authentication and update AuthContext
          await checkAuth();

          // Get redirect URL from localStorage (set during login)
          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          localStorage.removeItem('redirectAfterLogin');

          // Validate and redirect
          if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
            window.location.href = redirectUrl;
          } else {
            router.push('/');
          }
        } catch {
          // On verification failure, redirect to login
          router.push('/auth/login');
        }
      } else {
        // No success param, redirect to login
        router.push('/auth/login');
      }
    };

    handleAuth();
  }, [router, checkAuth]);

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
      return allowedDomains.some((domain) => parsedUrl.origin.includes(domain as string));
    } catch {
      return false;
    }
  };

  return <></>; // Blank screen
}