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
      className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-24 text-center text-gray-800 dark:text-gray-200"
    >
      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-1.5 inline-block rounded-full bg-blue-200 dark:bg-gray-600/50 px-3 py-1.5 text-sm">
          Beta Now Live!
        </span>
        <h1 className="max-w-3xl bg-gradient-to-br from-gray-200 to-gray-700 dark:from-white dark:to-gray-400 bg-clip-text text-9xl leading-tight text-transparent sm:text-5xl md:text-7xl">
          Experience Social Media Like Never Before.
        </h1>
        <p className="my-6 max-w-xl text-base leading-relaxed md:text-lg">
          Mosaic centralizes video streaming, shorts, and community-driven content
          into one seamless experience.
        </p>
        <Link href="/auth/register">
          <motion.button
            style={{ border, boxShadow }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 transition-colors hover:bg-gray-950/50"
          >
            Get Started.
            <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
          </motion.button>
        </Link>
      </div>
      
      {/* Stars Background */}
      <div className="absolute inset-0 z-0">
        <Canvas className='hidden dark:contents'>
          <Stars 
            radius={50}
            count={2500}
            factor={4}
            fade
            speed={2}
          />
        </Canvas>
      </div>
    </motion.section>
  );
}