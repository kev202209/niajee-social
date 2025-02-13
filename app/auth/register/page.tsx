'use client'

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

interface DeviceDetails {
  device: string;
  location: string;
}

export default function RegisterPage() {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow">
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
              className="w-full p-2 border rounded mb-3 mr-1.5"
            />
            
            {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label> */}
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            </div>
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            
            <button
              onClick={handleEmailCheck}
              className="w-full p-2 bg-blue-500 text-white rounded mb-3"
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
                onClick={() => signIn('google')}
                className="w-full p-2 bg-red-500 text-white rounded flex items-center justify-center gap-2"
              >
                <FaGoogle /> Sign up with Google
              </button>
              <button
                onClick={() => signIn('facebook')}
                className="w-full p-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2"
              >
                <FaFacebook /> Sign up with Facebook
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-white dark:text-blue-600">Set up Profile</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Birthday</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
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
                className="w-full p-2 border rounded mb-1"
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
              className="w-full p-2 border rounded mb-3"
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="p-2 bg-blue-600 text-white rounded"
              >
                Back
              </button>
              <button
                onClick={() => { setStep(3); setError(''); }}
                disabled={!formData.username}
                className={`p-2 text-white rounded ${!formData.username ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-blue-600 dark:text-white">Set up Password</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            
            <label className="block text-sm font-medium text-blue-500 dark:text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="p-2 bg-blue-600 text-white rounded"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                className="p-2 bg-blue-600 text-white rounded"
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
  );
}
