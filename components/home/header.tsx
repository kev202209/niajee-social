import { FC, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DarkModeToggle from "../DarkModeToggle";
import useOutsideClick from "@/hooks/useOutsideClick";
import {
  FiSearch,
  FiUser,
  FiSettings,
  FiLogOut,
  FiPlus,
} from "react-icons/fi";





const Header: FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(profileMenuRef, () => setShowProfileMenu(false));

  return (
    <header className="w-full fixed top-0 z-50 bg-white dark:bg-gray-900/80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 justify-between">
        {/* Logo on Left */}
        <div className="flex-shrink-0">
        <Link href="/" className=" font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient">MOSAIC</Link>
        </div>
        {/* Center: Smaller Search Bar */}
        <div className="flex-1 mx-4 flex justify-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full max-w-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        {/* Right: Dark Mode Toggle & Profile */}
        <div className="flex items-center space-x-4">
          <DarkModeToggle />
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="focus:outline-none"
            >
              <Image
                src="/placeholder.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full h-7 w-7"
              />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
                <div className="mb-2">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    Username
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    user@example.com
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <ul>
                    <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <FiPlus className="mr-2" /> <span>Add Content</span>
                    </li>
                    <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <FiSettings className="mr-2" /> <span>Settings</span>
                    </li>
                    <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <DarkModeToggle />
                      <span>Dark Mode</span>{" "}
                    </li>
                    <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <FiUser className="mr-2" /> <span>Profile</span>
                    </li>
                    <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <FiLogOut className="mr-2" /> <span>Logout</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;