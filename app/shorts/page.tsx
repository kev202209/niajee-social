"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShortsSkeleton from './[v]/ShortSkeleton';

const ShortsPage = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/feed?limit=1`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          console.error('Failed to fetch shorts');
          return;
        }

        const data = await response.json();
        const firstShort = data.shorts?.[0] ?? data.data?.[0];

        if (firstShort?.id) {
          // Replace current history entry so back button works correctly
          router.replace(`/shorts/${firstShort.id}`);
        } else {
          console.error('No shorts available');
          // Optionally redirect to a "no content" page or home
          router.replace('/');
        }
      } catch (error) {
        console.error('Error fetching shorts:', error);
        router.replace('/');
      }
    };

    fetchAndRedirect();
  }, [router]);

  // Show loading skeleton while fetching and redirecting
  return <ShortsSkeleton />;
};

export default ShortsPage;