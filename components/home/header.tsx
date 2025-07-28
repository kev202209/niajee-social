"use client";
import { FC, useRef, useState, useEffect } from "react";
import Link from "next/link";
import DarkModeToggle from "../DarkModeToggle";
import useOutsideClick from "@/hooks/useOutsideClick";
import {
  FiSearch,
  FiUser,
  FiSettings,
  FiLogOut,
  FiPlus,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedImage from "@/components/Image";

const Header: FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const api_link = process.env.NEXT_PUBLIC_API_URL;
  useOutsideClick(profileMenuRef, () => setShowProfileMenu(false));

  const [tagline, setTagline] = useState<string>("Loading...");

  useEffect(() => {
    fetch(`${api_link}/api/content/taglines`)
      .then((res) => res.json())
      .then((data) => setTagline(data.tagline))
      .catch(() => setTagline("Craft your digital legacy."));
  }, []);

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="w-full fixed top-0 z-50 bg-white dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <Link
            href="/"
            className="font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient text-xl sm:text-2xl md:text-3xl"
          >
            MOSAIC
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 mx-4 flex justify-center max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Right: Dark Mode Toggle & Profile Menu */}
        <div className="flex items-center space-x-3">
          <DarkModeToggle />
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="focus:outline-none ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 rounded-full transition-all duration-200"
            >
              <AuthenticatedImage
                mediaKey={user?.profilePic || ""}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full"
                fallbackSrc="/placeholder.png"
              />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {user ? user.username : "Username"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user ? user.email : "user@example.com"}
                  </p>
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link href="/create" className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <FiPlus className="mr-3 w-4 h-4" />
                      <span className="text-sm">Create</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <FiUser className="mr-3 w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <FiSettings className="mr-3 w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <FiLogOut className="mr-3 w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
