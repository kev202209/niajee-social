'use client';

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';

interface DeviceDetails {
  device: string;
  location: string;
}

const getRandomValueInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

interface ColorBlob {
  id: string;
  className: string;
  size: number;   // The base size in pixels (should match the Tailwind size)
  margin: number; // Extra margin to account for the blur effect
}

import { MotionValue } from "framer-motion";

interface MotionValues {
  x: MotionValue<number>;
  y: MotionValue<number>;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}

export default function RegisterPage() {
  const containerRef = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      birthday: '',
      // profilePicture now stores a File or null
      profilePicture: null as File | null,
      username: '',
      password: '',
      confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
  
    // Handle text input changes.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    // Handle file input change.
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setFormData(prev => ({ ...prev, profilePicture: files[0] }));
    };
  
    // Step 1: Check if the email is available by calling the backend directly.
    const handleEmailCheck = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          const text = await res.text();
          console.error('Response not JSON:', text);
          throw new Error(text);
        }
  
        if (res.ok) {
          setStep(2);
          setError('');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Server error');
        console.error(err);
      }
    };
  
    // Final registration: validate and submit all data.
    const handleRegister = async () => {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
  
      // Capture device details.
      const deviceDetails: DeviceDetails = {
        device: navigator.userAgent,
        location: 'Unknown', // Replace with actual location if needed.
      };
  
      try {
        // Create a FormData object for the file upload.
        const form = new FormData();
        form.append('firstName', formData.firstName);
        form.append('lastName', formData.lastName);
        form.append('email', formData.email);
        form.append('birthday', formData.birthday);
        form.append('username', formData.username);
        form.append('password', formData.password);
        form.append('deviceDetails', JSON.stringify(deviceDetails));
        if (formData.profilePicture) {
          form.append('profilePicture', formData.profilePicture);
        }
  
        // Do not set Content-Type header manually when using FormData.
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          body: form,
        });
        const data = await res.json();
        if (res.ok) {
          setStep(4);
          setMessage(data.message);
          setError('');
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
      className="relative min-h-screen min-w-screen overflow-hidden bg-gradient-to-br from-white to-gray-200 dark:from-black dark:to-gray-800"
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
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#ffffff,theme(colors.slate.200)_50%,#ffffff)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.300/.48)_80%,theme(colors.blue.500)_86%,theme(colors.blue.300)_90%,theme(colors.blue.500)_94%,theme(colors.slate.300/.48))_border-box] dark:[background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.indigo.500)_86%,theme(colors.indigo.300)_90%,theme(colors.indigo.500)_94%,theme(colors.slate.600/.48))_border-box]  rounded-2xl border border-1.5 border-transparent animate-border">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-blue-500 dark:text-white">Welcome to Mosaic</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className='flex flex-row'>
            {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label> */}
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3 mr-1.5 dark:bg-inherit "
            />
            
            {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label> */}
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3 dark:bg-inherit"
            />
            </div>
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3 dark:bg-inherit"
            />
            
            <button
              onClick={handleEmailCheck}
              className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl mb-3"
            >
              Continue
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
                onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
                className="w-full p-2 dark:bg-sky-500/10 bg-sky-600 hover:bg-sky-500/80 text-white dark:hover:bg-sky-500/80 dark:text-white rounded-xl flex items-center justify-center gap-2"
              >
                <FaGoogle /> Sign up with Google
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-white dark:text-blue-600">Set up Profile</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Birthday</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3 dark:bg-inherit text-black dark:text-white"
            />
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">
              Upload Profile Picture (optional)
            </label>
            <div className="flex flex-col items-center mb-3">
              {formData.profilePicture ? (
                <img
                  src={URL.createObjectURL(formData.profilePicture)}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover mb-2"
                />
              ) : (
                <img
                  src="/placeholder.png"
                  alt="Placeholder Avatar"
                  className="w-32 h-32 rounded-full object-cover mb-2"
                />
              )}
              <input
                type="file"
                name="profilePicture"
                onChange={handleFileChange}
                className="w-full p-2 border rounded mb-1 text-black dark:text-white"
              />
              <p className="text-sm text-gray-500">This is optional</p>
            </div>
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3 dark:bg-inherit text-black dark:text-white"
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => { setStep(3); setError(''); }}
                disabled={!formData.username}
                className={`p-2 text-white rounded ${!formData.username ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 rounded-xl'}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Set up Password</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3 dark:bg-inherit text-black dark:text-white"
            />
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3 dark:bg-inherit text-black dark:text-white"
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
            <p>{message}</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
