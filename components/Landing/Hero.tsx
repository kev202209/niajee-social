'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { FiArrowRight } from "react-icons/fi";
import { useTheme } from "next-themes";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";

// Colors for the animated gradient
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export default function Hero() {
  const { theme } = useTheme();
  
  // Animated color value for gradient
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  // Dynamic styles using Framer Motion's template function
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, ${theme === "light" ? "#ffffff" : "#020617"} 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{ backgroundImage }}
      className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-24 text-center text-gray-800 dark:text-gray-200"
    >
      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto px-4 sm:px-6">
        <motion.span 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-block rounded-full bg-blue-200 dark:bg-gray-600/50 px-3 py-1.5 text-xs sm:text-sm font-medium"
        >
          Beta Now Live!
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-200 to-gray-700 dark:from-white dark:to-gray-400 bg-clip-text font-bold text-transparent 
                     text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl 
                     leading-[1.1] tracking-tight mb-6"
        >
          Experience Social Media Like Never Before.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="my-6 max-w-xl text-sm xs:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300"
        >
          Mosaic centralizes video streaming, shorts, and community-driven content
          into one seamless experience.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <Link href="/auth/register">
            <motion.button
              style={{ border, boxShadow }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex w-fit items-center gap-1.5 rounded-full 
                         dark:bg-gray-950/10 dark:hover:bg-gray-950/50
                         bg-gray-800/90 hover:bg-gray-900
                         px-4 py-2 sm:px-6 sm:py-3 
                         text-sm sm:text-base md:text-lg font-medium
                         text-white dark:text-gray-200
                         transition-colors"
            >
              Get Started
              <FiArrowRight className="ml-1 transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Add floating UI elements that respond to cursor/scroll */}
        <div className="absolute top-20 -left-4 w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-500/10 blur-xl" />
        <div className="absolute bottom-20 -right-10 w-32 h-32 md:w-40 md:h-40 rounded-full bg-purple-500/10 blur-xl" />
      </div>
      
      {/* Stars Background */}
      <div className="absolute inset-0 z-0">
        <Canvas className='hidden dark:block'>
          <Stars 
            radius={50}
            count={2500}
            factor={4}
            fade
            speed={2}
          />
        </Canvas>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scroll to explore</span>
        <motion.div 
          className="w-1 h-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden"
          animate={{ 
            boxShadow: [
              `0 0 0 0 rgba(${theme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, 0.1)`,
              `0 0 0 8px rgba(${theme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, 0)`
            ]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatType: "loop" 
          }}
        >
          <motion.div 
            className="w-full bg-blue-500 h-4"
            animate={{ y: [0, 32, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut" 
            }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}