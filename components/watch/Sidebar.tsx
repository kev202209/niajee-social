import { FC } from "react";
import {
  Home,
  TrendingUp,
  LaptopMinimalCheck,
  Library,
  History,
  Download,
} from "lucide-react";

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
      <ul className="space-y-2 p-4">
        <li className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer">
          <Home className="w-5 h-5 mr-3" />
          <span className="text-gray-900 dark:text-gray-100">Home</span>
        </li>
        <li className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer">
          <TrendingUp className="w-5 h-5 mr-3" />
          <span className="text-gray-900 dark:text-gray-100">Trending</span>
        </li>
        <li className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer">
          <LaptopMinimalCheck className="w-5 h-5 mr-3" />
          <span className="text-gray-900 dark:text-gray-100">Subscriptions</span>
        </li>
        <li className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer">
          <Library className="w-5 h-5 mr-3" />
          <span className="text-gray-900 dark:text-gray-100">Library</span>
        </li>
        <li className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer">
          <History className="w-5 h-5 mr-3" />
          <span className="text-gray-900 dark:text-gray-100">History</span>
        </li>
        <li className="flex items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer">
          <Download className="w-5 h-5 mr-3" />
          <span className="text-gray-900 dark:text-gray-100">Downloads</span>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
