'use client';
import Link from 'next/link'
import DarkModeToggle from '@/components/DarkModeToggle'
import { useState } from 'react';
import {  Menu, X,} from "lucide-react";
import Logo from '@/components/Logo'

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
      <header className="w-full fixed top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="text-5xl font-bold gradient-text">
              <Logo/>
            </div>
            {/* Desktop Auth & Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              <DarkModeToggle />
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </div>
            {/* Mobile Hamburger Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4 mt-2">
                <Link
                  href="#why-join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Why Join
                </Link>
                <Link
                  href="#download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Download
                </Link>
                <Link
                  href="#parallax"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Discover
                </Link>
              </nav>
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <DarkModeToggle />
                </div>
                <div className="mt-2 flex flex-col space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition text-center"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
  )
}
