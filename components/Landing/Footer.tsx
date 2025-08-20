'use client';

import React from "react";
import Link from "next/link";
import Logo from "../Logo";
// import { FiGithub, FiTwitter, FiInstagram, FiYoutube } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="pt-16 pb-10 bg-indigo-100 dark:bg-indigo-950 text-gray-600 dark:text-gray-300 border-t border-gray-200/70 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-14">
          {/* Company Info */}
          <div>
            <div className="text-3xl font-bold mb-5">
              <Logo asLink />
            </div>
            <p className="mb-5 leading-relaxed text-gray-600 dark:text-gray-400">
              Bringing communities together through innovative social media experiences.
            </p>
            {/* Socials (optional, uncomment if needed)
            <div className="flex space-x-4 mt-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiGithub className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiYoutube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
            */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-blue-500 dark:text-gray-100">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/legals/contact-us"
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-blue-500 dark:text-gray-100">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legals/gdpr"
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  GDPR
                </Link>
              </li>
              <li>
                <Link
                  href="/legals/privacy-policy"
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legals/cookie-policy"
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legals/terms"
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {currentYear} Niajee. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}