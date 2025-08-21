'use client';

import React, { useRef, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ColorBlob {
  id: string;
  className: string;
  size: number;   // The base size in pixels (should match the Tailwind size)
  margin: number; // Extra margin to account for the blur effect
}

// Blob Animation Component
const BlobAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // blobs is stable (memoized) so it won't recreate every render
  const blobs = useMemo<ColorBlob[]>(
    () => [
      {
        id: "blob1",
        className:
          "absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-pink-400 to-purple-500 dark:from-purple-600 dark:to-pink-500 rounded-full opacity-80 filter blur-2xl mix-blend-normal dark:mix-blend-lighten",
        size: 320,
        margin: 40,
      },
      {
        id: "blob2",
        className:
          "absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-400 dark:from-blue-500 dark:to-cyan-400 rounded-full opacity-80 filter blur-3xl mix-blend-normal dark:mix-blend-lighten",
        size: 384,
        margin: 60,
      },
      {
        id: "blob3",
        className:
          "absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-green-300 to-teal-400 dark:from-green-400 dark:to-teal-500 rounded-full opacity-80 filter blur-2xl mix-blend-normal dark:mix-blend-lighten",
        size: 288,
        margin: 40,
      },
      {
        id: "blob4",
        className:
          "absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-yellow-300 to-orange-400 dark:from-yellow-400 dark:to-orange-300 rounded-full opacity-80 filter blur-3xl mix-blend-normal dark:mix-blend-lighten",
        size: 320,
        margin: 60,
      },
    ],
    []
  );

  // Call motion hooks once per blob (top-level in component) - order fixed
  const baseX1 = useMotionValue<number>(0);
  const baseY1 = useMotionValue<number>(0);
  const springX1 = useSpring(baseX1, { stiffness: 120, damping: 20 });
  const springY1 = useSpring(baseY1, { stiffness: 120, damping: 20 });

  const baseX2 = useMotionValue<number>(0);
  const baseY2 = useMotionValue<number>(0);
  const springX2 = useSpring(baseX2, { stiffness: 120, damping: 20 });
  const springY2 = useSpring(baseY2, { stiffness: 120, damping: 20 });

  const baseX3 = useMotionValue<number>(0);
  const baseY3 = useMotionValue<number>(0);
  const springX3 = useSpring(baseX3, { stiffness: 120, damping: 20 });
  const springY3 = useSpring(baseY3, { stiffness: 120, damping: 20 });

  const baseX4 = useMotionValue<number>(0);
  const baseY4 = useMotionValue<number>(0);
  const springX4 = useSpring(baseX4, { stiffness: 120, damping: 20 });
  const springY4 = useSpring(baseY4, { stiffness: 120, damping: 20 });

  const motionValues = [
    { x: baseX1, y: baseY1, springX: springX1, springY: springY1 },
    { x: baseX2, y: baseY2, springX: springX2, springY: springY2 },
    { x: baseX3, y: baseY3, springX: springX3, springY: springY3 },
    { x: baseX4, y: baseY4, springX: springX4, springY: springY4 },
  ];

  const getRandomValueInRange = (min: number, max: number): number =>
    Math.random() * (max - min) + min;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // store active timeout ids so we can clear them on unmount
    const timers: number[] = [];

    const animateBlob = (index: number) => {
      const mv = motionValues[index];
      const { size, margin } = blobs[index];

      // Re-read container size on every animation step so responsive resizes are respected
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // If the container might be smaller than the blob, clamp target ranges
      const minX = margin;
      const maxX = Math.max(minX, containerWidth - size - margin);
      const minY = margin;
      const maxY = Math.max(minY, containerHeight - size - margin);

      const targetX = getRandomValueInRange(minX, maxX);
      const targetY = getRandomValueInRange(minY, maxY);

      mv.x.set(targetX);
      mv.y.set(targetY);

      // Schedule the next animation update between 2 and 4 seconds.
      const delay = getRandomValueInRange(2000, 4000);
      const t = window.setTimeout(() => animateBlob(index), delay);
      timers.push(t);
    };

    blobs.forEach((_, index) => animateBlob(index));

    return () => {
      // clear pending timeouts on unmount
      timers.forEach(id => clearTimeout(id));
    };
    // motionValues items and blobs are stable (hooks called in fixed order and blobs is memoized)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobs, baseX1, baseY1, baseX2, baseY2, baseX3, baseY3, baseX4, baseY4]);

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