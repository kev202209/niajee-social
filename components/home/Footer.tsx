import { FC } from 'react';
import Logo from '@/components/Logo';

const Footer: FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-6 mt-8 w-full">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
        <span className="flex items-center mb-2">
          <span className="text-lg">© {new Date().getFullYear()} . </span>

          <Logo size="small" /> {/* Use small size for uniformity */}
          <span className="text-lg">. All rights reserved.</span>
        </span>
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
          Made with ❤️ by Kenyan Devs
        </p>
      </div>
    </footer>
  );
};

export default Footer;