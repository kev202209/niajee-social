'use client';

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { MotionValue } from "framer-motion";


const getRandomValueInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

interface DeviceDetails {
  device: string;
  location: string;
}
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

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);

 const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    // Capture device details (simplified example).
    const deviceDetails: DeviceDetails = {
      device: navigator.userAgent,
      location: 'Unknown', // Replace with actual location if desired.
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, deviceDetails }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Login successful!');
        setError('');
        // Redirect to home page after a successful login.
        window.location.href = '/';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error');
      console.error(err);
    }
  };


  // Updated blob definitions: all start from top-0 left-0 so that the x/y transforms work consistently.
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

  // Create motion values for each blob
  const motionValues: MotionValues[] = blobs.map(() => {
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
    <div
      ref={containerRef}
      className="relative  w-full overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800"
    >
      {/* Animated Cosmic Color Blobs */}
      {blobs.map((blob, index) => (
        <motion.div
          key={blob.id}
          style={{ x: motionValues[index].springX, y: motionValues[index].springY }}
          className={blob.className}
        />
      ))}

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
        <h1 className="text-2xl font-bold mb-4 text-blue-500 dark:text-white">Login</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {message && <p className="text-green-500 mb-2">{message}</p>}
        
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email or Username
        </label>
        <input
          type="text"
          placeholder="Enter your email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border rounded mb-4 dark:bg-inherit text-black dark:text-white"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4 dark:bg-inherit text-black dark:text-white"
        />

        <button
          onClick={handleLogin}
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded mb-4"
        >
          Login
        </button>

        {/* Centered OR divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* OAuth Buttons with icons */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => signIn('google')}
            className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center gap-2"
          >
            <FaGoogle /> Login with Google
          </button>
          <Link
            href='/auth/forget-password'
            className="w-full p-2 text-blue-600 dark:text-white flex items-center justify-center gap-2"
          >
         forgot Password
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
