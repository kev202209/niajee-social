import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-2xl font-bold gradient-text">
            <Link href="/">MOSAIC</Link>
          </div>
          <div className="flex space-x-6">
            <Link
              href="/about"
              className="hover:text-white dark:hover:text-gray-200"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="hover:text-white dark:hover:text-gray-200"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="hover:text-white dark:hover:text-gray-200"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white dark:hover:text-gray-200"
            >
              Privacy
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          © {new Date().getFullYear()} Mosaic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}