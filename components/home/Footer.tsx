import { FC } from 'react';
import Link from 'next/link';


const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} <span> </span> 
        <Link
              href="/"
              className="font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient"
            >
              MOSAIC
            </Link>
          . All rights reserved.</p>
      </div>
    </footer>
  );
};


export default Footer;