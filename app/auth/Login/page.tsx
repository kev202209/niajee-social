// app/auth/login/page.tsx
'use client'

import { useState } from 'react';

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
      location: 'Unknown', // For a real app, consider using the Geolocation API.
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
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
      <input
        type="text"
        placeholder="Email or Username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleLogin}
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Login
      </button>
    </div>
  );
}
