import { FC } from 'react';


const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} Mosaic. All rights reserved.</p>
      </div>
    </footer>
  );
};


export default Footer;