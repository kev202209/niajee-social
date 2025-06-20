'use client';

import type { NextPage } from 'next';
import Link from 'next/link';

const NotFoundPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-animation dark:bg-gradient-animation-dark flex flex-col items-center justify-center px-4">
      <div className="p-8 rounded-lg text-center max-w-md">
        <h1 className="text-5xl font-bold gradient-text text-gray-700 dark:text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-700 dark:text-white mb-6">
          Oops! The page you&apos;re looking for can&apos;t be found.
        </p>
        <p className="text-gray-600 dark:text-white mb-8">
          It seems we've misplaced this page. Don't worry, you can always head back to the homepage.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
