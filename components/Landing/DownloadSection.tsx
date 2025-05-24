import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function DownloadSection() {
  return (
    <section id="download" className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center">
        {/* Left: Details and Buttons */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Download Our App
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Experience Mosaic on your mobile device. Enjoy a unified social media
            experience at your fingertips.
          </p>
          <div className="flex space-x-4">
            <Link
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-500 dark:bg-green-600 text-white rounded-full hover:bg-green-600 dark:hover:bg-green-700 transition"
            >
              Android
            </Link>
            <Link
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition"
            >
              iOS
            </Link>
          </div>
        </div>
        {/* Right: App Screenshot */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src="/app-screenshot.jpg"
            alt="App Screenshot"
            width={400}
            height={800}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}