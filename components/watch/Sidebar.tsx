import { FC } from "react";
import {
  Home,
  TrendingUp,
  LaptopMinimalCheck,
  Library,
  History,
  Download,
  PlusCircle,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`w-60 bg-gray-100 dark:bg-gray-900 h-screen pt-16 fixed left-0 top-0 overflow-y-auto transition-transform duration-300 ease-in-out z-[50] ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Close button with chevron */}
      <div className="flex justify-end p-4 pb-2">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Close sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      <ul className="space-y-2 px-4 pb-4">
        {/* Home */}
        <li>
          <Link 
            href="/" 
            className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
            onClick={onClose}
          >
            <Home className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100">Home</span>
          </Link>
        </li>

        {/* Create */}
        <li>
          <Link 
            href="/create" 
            className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
            onClick={onClose}
          >
            <PlusCircle className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100">Create</span>
          </Link>
        </li>

        {/* Trending */}
        <li>
          <Link 
            href="/trending" 
            className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
            onClick={onClose}
          >
            <TrendingUp className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100">Trending</span>
          </Link>
        </li>

        {/* Subscriptions */}
        <li>
          <Link 
            href="/subscriptions" 
            className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
            onClick={onClose}
          >
            <LaptopMinimalCheck className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100">Subscriptions</span>
          </Link>
        </li>

        {/* Library */}
        <li>
          <Link 
            href="/library" 
            className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
            onClick={onClose}
          >
            <Library className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100">Library</span>
          </Link>
        </li>

        {/* History */}
        <li>
          <Link 
            href="/history" 
            className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
            onClick={onClose}
          >
            <History className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100">History</span>
          </Link>
        </li>

        {/* Downloads */}
        <li>
          <Link 
            href="/downloads" 
            className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
            onClick={onClose}
          >
            <Download className="w-5 h-5 mr-3 text-gray-700 dark:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-100">Downloads</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
