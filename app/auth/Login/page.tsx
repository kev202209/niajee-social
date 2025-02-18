'use client'

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Link2Icon } from 'lucide-react';
import Link from 'next/link';

interface DeviceDetails {
  device: string;
  location: string;
}

export default function LoginPage() {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 ">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow [background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] rounded-2xl border border-1.5 border-transparent animate-border">
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
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full p-2 bg-blue-500 text-white rounded mb-4"
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
            className="w-full p-2 bg-red-500 text-white rounded flex items-center justify-center gap-2"
          >
            <FaGoogle /> Login with Google
          </button>
          <Link
            href='/auth/forget-password'
            className="w-full p-2 text-grey-500 flex items-center justify-center gap-2"
          >
         forgot Password
          </Link>
        </div>
      </div>
    </div>
  );
}
