'use client';

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoLogoApple, IoLogoGooglePlaystore } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";

export default function DownloadSection() {
  const [activeScreen, setActiveScreen] = useState(0);
  
  const screens = [
    { src: "/app-screenshot-1.jpg", alt: "Home Feed" },
    { src: "/app-screenshot-2.jpg", alt: "Video Player" },
    { src: "/app-screenshot-3.jpg", alt: "Community Chat" },
  ];

  // Fallback to use if the images don't exist yet
  const fallbackSrc = "/app-screenshot.jpg";

  return (
    <section id="download" className="py-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium mb-3">
            Mobile Apps
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Take Mosaic Everywhere
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
            Download our mobile apps and stay connected with your community wherever you go.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
          {/* Left: Phone mockup with screenshots */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            {/* Phone frame */}
            <div className="relative mx-auto w-[280px] md:w-[320px]">
              <Image
                src="/phone-mockup.png" 
                alt="Phone mockup"
                width={320}
                height={650}
                className="relative z-10"
                onError={(e) => {
                  // Fallback styling if the mockup image doesn't exist
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.classList.remove("absolute");
                    e.currentTarget.nextElementSibling.classList.add("rounded-3xl", "border-4", "border-gray-800");
                  }
                }}
              />
              
              {/* App screenshot */}
              <motion.div
                className="absolute top-[6%] left-[6%] right-[6%] bottom-[6%] overflow-hidden rounded-[24px] z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                key={activeScreen}
              >
                <Image
                  src={screens[activeScreen].src}
                  alt={screens[activeScreen].alt}
                  width={280}
                  height={580}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = fallbackSrc;
                  }}
                />
              </motion.div>
              
              {/* Screen selector dots */}
              <div className="flex justify-center space-x-2 mt-8">
                {screens.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveScreen(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      activeScreen === index 
                        ? "bg-purple-500 dark:bg-purple-400" 
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    aria-label={`View ${screens[index].alt} screenshot`}
                  />
                ))}
              </div>

              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-400/30 dark:bg-purple-700/20 rounded-full blur-[80px]"></div>
            </div>
          </motion.div>

          {/* Right: Download info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Experience Mosaic on your device
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our app is designed to provide the best possible experience on mobile devices.
              Share content, watch videos, and connect with your community wherever you are.
            </p>
            
            <div className="space-y-4">
              <motion.a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full sm:w-auto justify-center gap-3 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoLogoGooglePlaystore className="text-2xl" />
                <div className="text-left">
                  <div className="text-xs font-light">Download on</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </motion.a>
              
              <motion.a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full sm:w-auto justify-center gap-3 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoLogoApple className="text-2xl" />
                <div className="text-left">
                  <div className="text-xs font-light">Download on</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </motion.a>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <FiDownload className="text-xl" />
                  <span>Over 100,000+ downloads worldwide</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}