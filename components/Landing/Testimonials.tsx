'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ParticleBackground from "./ParticleBackground";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const testimonials = [
    {
      quote: "Niajee has completely transformed how I consume social media. Everything I need is in one place!",
      author: "Alex Johnson",
      role: "Content Creator",
      avatar: "/avatars/avatar-1.jpg",
      rating: 5,
    },
    {
      quote: "The seamless integration between long-form videos and shorts makes Niajee stand out from other platforms.",
      author: "Samantha Lee",
      role: "Lifestyle Influencer",
      avatar: "/avatars/avatar-2.jpg",
      rating: 5,
    },
    {
      quote: "I've been able to grow my community faster on Niajee than on any other platform I've used before.",
      author: "Marcus Chen",
      role: "Gaming Streamer",
      avatar: "/avatars/avatar-3.jpg",
      rating: 4,
    },
    {
      quote: "The real-time engagement features are incredible. I feel so much more connected to my audience.",
      author: "Priya Patel",
      role: "Educational Creator",
      avatar: "/avatars/avatar-4.jpg",
      rating: 5,
    },
  ];

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const handlePrev = () => {
    setAutoplay(false);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setAutoplay(false);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="relative py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground 
        className="z-0" 
        color="#9333ea" 
        density={40} 
        connectionOpacity={0.05}
        particleOpacity={0.15}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-medium mb-3">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            What Our Users Say
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
            Join thousands of satisfied users who have transformed their social media experience with Niajee.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Background decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl -z-10"></div>
          
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
            <svg className="absolute text-blue-500/20 w-24 h-24 -top-8 -left-8" width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
              <path d="M13.333 26.667c0-7.333 5.333-13.333 12-13.333v-6.667c-10.667 0-18.667 8.667-18.667 20v6.667h13.333v-6.667h-6.667zM33.333 26.667c0-7.333 5.334-13.333 12-13.333v-6.667c-10.666 0-18.666 8.667-18.666 20v6.667h13.333v-6.667h-6.667z" />
            </svg>
            
            {/* Testimonial Slider */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-6 flex items-center justify-center">
                    {/* Star rating */}
                    <div className="flex space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonials[current].rating
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <p className="text-xl md:text-2xl text-center font-medium text-gray-700 dark:text-gray-300 mb-8">
                    &quot;{testimonials[current].quote}&quot;
                  </p>
                  
                  <div className="flex items-center">
                    <div className="relative w-14 h-14 mr-4">
                      <Image
                        src={testimonials[current].avatar}
                        alt={testimonials[current].author}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          // Fallback for missing avatars
                          e.currentTarget.src = "https://via.placeholder.com/56?text=" + testimonials[current].author.charAt(0);
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {testimonials[current].author}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {testimonials[current].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between items-center pointer-events-none px-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-gray-800 dark:text-gray-200 pointer-events-auto"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-gray-800 dark:text-gray-200 pointer-events-auto"
                >
                  <FiChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
            
            {/* Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrent(i);
                    setAutoplay(false);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    current === i
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}