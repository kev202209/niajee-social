'use client';

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function ParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform values for parallax effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]); // Back layer - slowest
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]); // Middle layer
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]); // Front layer - fastest
  const opacity = useTransform(scrollYProgress, [0, 0.5, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  return (
    <section
      id="parallax"
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layer (mountains/sky) - slowest moving */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 bg-fixed bg-bottom bg-cover z-0"
        aria-hidden="true"
      >
        <div 
          className="w-full h-full bg-center bg-cover"
          style={{ backgroundImage: "url('/parallax-bg-1.jpg')" }}
        />
      </motion.div>
      
      {/* Middle layer (hills/trees) */}
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 bg-fixed bg-bottom bg-cover z-10"
        aria-hidden="true"
      >
        <div 
          className="w-full h-full bg-center bg-cover"
          style={{ backgroundImage: "url('/parallax-bg-2.jpg')" }}
        />
      </motion.div>
      
      {/* Front layer (foreground elements) - fastest moving */}
      <motion.div
        style={{ y: y3 }}
        className="absolute inset-0 bg-fixed bg-bottom bg-cover z-20"
        aria-hidden="true"
      >
        <div 
          className="w-full h-full bg-center bg-cover"
          style={{ backgroundImage: "url('/parallax-bg-3.jpg')" }}
        />
      </motion.div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-30"></div>
      
      {/* Content */}
      <motion.div 
        className="relative z-40 text-center px-4 max-w-4xl mx-auto"
        style={{ opacity, scale }}
      >
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-100/20 text-indigo-100 text-sm font-medium mb-4">
          Discover More
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Experience the Difference
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Join thousands of creators and viewers on a platform designed to bring communities together.
          Discover content that inspires, entertains, and connects.
        </p>
        <Link href="/auth/register">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-full font-medium hover:bg-indigo-50 transition-colors"
          >
            Join the Community
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        </Link>
      </motion.div>
      
      {/* Optional: Animated particles or floating elements */}
      <div className="absolute inset-0 z-25 pointer-events-none">
        {/* You could add particle effects here */}
      </div>
    </section>
  );
}