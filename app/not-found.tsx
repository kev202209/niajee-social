import type { NextPage } from 'next';
import Link from 'next/link';

const NotFoundPage: NextPage = () => {
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-5xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! The page you&apos;re looking for can&apos;t be found.</p>
        <p className="text-gray-600 mb-8">
          It seems we've misplaced this page.  Don't worry, you can always head back to the homepage.
        </p>
        <Link href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go Home
        </Link>

        {/* Optional: Add a subtle illustration or image */}
        {/* <div className="mt-8">
          <img src="/images/404-illustration.svg" alt="404 Illustration" className="w-64 mx-auto" /> 
        </div> */}

        {/* Optional: Add a search bar if your site has one */}
        {/* <div className="mt-8">
          <input type="text" placeholder="Search our site..." className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div> */}

      </div>
    </div>
  );
};

export default NotFoundPage;