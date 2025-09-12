'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import Logo from '@/components/Logo';
import { usePostHog } from 'posthog-js/react'; // Import the hook

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const posthog = usePostHog(); // Initialize PostHog hook

  // Helper to track events
  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    posthog.capture(eventName, properties);
  };

  return (
    <header className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg px-6 py-3 max-w-5xl w-full border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex-col ${isMobileMenuOpen ? 'rounded-b-lg' : 'rounded-full'}`}>
      {/* Main Header Bar */}
      <div className="flex justify-between items-center h-10">
        {/* Logo (left on mobile and desktop) */}
        <div className="text-3xl font-bold gradient-text">
          <Logo/>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/why"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition"
          >
            Why
          </Link>
          <Link
            href="/legals/contact-us"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition"
          >
            Contact Us
          </Link>
        </nav>
        
        {/* Desktop Auth & Toggle */}
        <div className="hidden md:flex items-center space-x-4">
          <DarkModeToggle />
          <Link
            href="/auth/login"
            onClick={() => trackEvent('login_button_clicked', { location: 'desktop_header' })}
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            onClick={() => trackEvent('register_button_clicked', { location: 'desktop_header' })}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition"
          >
            Register
          </Link>
        </div>
        
        {/* Mobile Hamburger Menu Button (moved to right) */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu (Integrated into Header) */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 px-6">
          <div className="flex items-center justify-between">
            <DarkModeToggle />
          </div>
          <div className="mt-2 flex flex-col space-y-2">
            <Link
              href="/why"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Why Niajee?
            </Link>
            <Link
              href="/legals/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Contact Us
            </Link>
            <Link
              href="/auth/login"
              onClick={() => {
                trackEvent('login_button_clicked', { location: 'mobile_menu' });
                setMobileMenuOpen(false);
              }}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              onClick={() => {
                trackEvent('register_button_clicked', { location: 'mobile_menu' });
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition text-center"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}