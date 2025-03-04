'use client';

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MotionValue } from "framer-motion";



interface ColorBlob {
    id: string;
    className: string;
    size: number;   // The base size in pixels (should match the Tailwind size)
    margin: number; // Extra margin to account for the blur effect
  }

  interface MotionValues {
    x: MotionValue<number>;
    y: MotionValue<number>;
    springX: MotionValue<number>;
    springY: MotionValue<number>;
  }

const getRandomValueInRange = (min: number, max: number): number =>
    Math.random() * (max - min) + min;
  
  // Blob Animation Component
  const BlobAnimation = () => {
    const containerRef = useRef<HTMLDivElement>(null);
  
    const blobs: ColorBlob[] = [
        {
          id: "blob1",
          className:
            "absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-pink-400 to-purple-500 dark:from-purple-600 dark:to-pink-500 rounded-full opacity-80 filter blur-2xl mix-blend-normal dark:mix-blend-lighten",
          size: 320,  // w-80 => ~320px
          margin: 40, // extra margin for blur-2xl
        },
        {
          id: "blob2",
          className:
            "absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-400 dark:from-blue-500 dark:to-cyan-400 rounded-full opacity-80 filter blur-3xl mix-blend-normal dark:mix-blend-lighten",
          size: 384,  // w-96 => ~384px
          margin: 60, // extra margin for blur-3xl
        },
        {
          id: "blob3",
          className:
            "absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-green-300 to-teal-400 dark:from-green-400 dark:to-teal-500 rounded-full opacity-80 filter blur-2xl mix-blend-normal dark:mix-blend-lighten",
          size: 288,  // w-72 => ~288px
          margin: 40,
        },
        {
          id: "blob4",
          className:
            "absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-yellow-300 to-orange-400 dark:from-yellow-400 dark:to-orange-300 rounded-full opacity-80 filter blur-3xl mix-blend-normal dark:mix-blend-lighten",
          size: 320,  // w-80 => ~320px
          margin: 60,
        },
      ];
  
    const motionValues = blobs.map(() => {
      const baseX = useMotionValue<number>(0);
      const baseY = useMotionValue<number>(0);
      return {
        x: baseX,
        y: baseY,
        springX: useSpring(baseX, { stiffness: 120, damping: 20 }),
        springY: useSpring(baseY, { stiffness: 120, damping: 20 }),
      };
    });
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const animateBlob = (index: number) => {
      const { x, y } = motionValues[index];
      const { size, margin } = blobs[index];

      // Calculate a target position that accounts for the blob's size and blur margin.
      const targetX = getRandomValueInRange(margin, containerWidth - size - margin);
      const targetY = getRandomValueInRange(margin, containerHeight - size - margin);

      x.set(targetX);
      y.set(targetY);

      // Schedule the next animation update between 2 and 4 seconds.
      const delay = getRandomValueInRange(2000, 4000);
      setTimeout(() => animateBlob(index), delay);
    };

    blobs.forEach((_, index) => animateBlob(index));
  }, [blobs, motionValues]);
  
    return (
      <div ref={containerRef} className="absolute w-full h-full overflow-hidden">
      {/* Animated Cosmic Color Blobs */}
      {blobs.map((blob, index) => (
        <motion.div
          key={blob.id}
          style={{ x: motionValues[index].springX, y: motionValues[index].springY }}
          className={blob.className}
        />
      ))}
      </div>
    );
  };

export default BlobAnimation;