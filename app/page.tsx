'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Home from '@/components/Home';
import Landing from '@/components/Landing';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('secureToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  if (isLoggedIn === null) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    // Show a different page or message for non-logged-in users.
    return (
      <Landing />
    );
  }

  // Render the home page for logged-in users.
  return (
    <Home />

  );
}
