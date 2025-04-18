import { FC } from 'react';
import Link from 'next/link';

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 py-4 mt-8 w-full">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
        <p className="flex items-center mb-2">
          <span className="text-lg">© {new Date().getFullYear()}</span>
          <Link
            href="/"
            className="font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient ml-2 text-xl"
          >
            MOSAIC
          </Link>
          <span className="text-lg">. All rights reserved.</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
          Made with ❤️ by Kenyan Devs
        </p>
      </div>
    </footer>
  );
};

export default Footer;