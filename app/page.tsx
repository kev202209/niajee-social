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
      // <div className="min-h-screen flex flex-col items-center justify-center">
      //   <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
      //     You are not logged in.
      //   </h1>
      //   <p className="mb-4 text-gray-700 dark:text-gray-300">
      //     Please log in to view your feed.
      //   </p>
      //   <button
      //     onClick={() => router.push('/login')}
      //     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      //   >
      //     Go to Login
      //   </button>
      // </div>
    );
  }

  // Render the home page for logged-in users.
  return (
    <Home />
    // <div className="min-h-screen p-8">
    //   <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
    //     Welcome to Fusion
    //   </h1>
    //   <p className="text-gray-900 dark:text-white">
    //     This is your main feed where you’ll see a mix of posts, videos, and updates from around the platform.
    //   </p>
    //   {/* Additional content for logged in users can go here */}
    // </div>
  );
}
