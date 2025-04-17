'use client';

import React, { FC, useState, useEffect } from 'react';
import { Rocket, Copy, Menu, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface LivePageProps {}

const LivePage: FC<LivePageProps> = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [streamKey, setStreamKey] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>(process.env.NEXT_PUBLIC_STREAM_SERVER_URL || 'rtmp://live.mosaic.com/app');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [chatEnabled, setChatEnabled] = useState<boolean>(true);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);

  // Generate a random stream key on mount
  useEffect(() => {
    const key = Math.random().toString(36).substring(2, 12);
    setStreamKey(key);
  }, []);

  // Handle thumbnail selection
  const handleThumbnail = (files: File[]) => {
    const file = files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleThumbnail,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const copyKey = () => {
    navigator.clipboard.writeText(streamKey);
    toast.info('Stream key copied to clipboard');
  };

  const handleStart = async () => {
    if (!title.trim()) {
      toast.error('Please enter a stream title.');
      return;
    }
    setStarting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('streamKey', streamKey);
      formData.append('serverUrl', serverUrl);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      formData.append('chatEnabled', String(chatEnabled));
      formData.append('visibility', isPublic ? 'public' : 'private');
      formData.append('channelId', '<YOUR_CHANNEL_ID>'); // Replace with dynamic channel ID

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/live/start`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Live stream started!');
    } catch (error) {
      toast.error('Failed to start live stream.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-800 dark:text-gray-200"
          >
            <Menu />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Go Live</h1>
        </div>

        <main className="p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Go Live</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stream Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter stream title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stream Key</label>
              <div className="flex">
                <input
                  type="text"
                  value={streamKey}
                  readOnly
                  className="flex-1 p-3 border rounded-l-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <button
                  onClick={copyKey}
                  className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
                >
                  <Copy />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Server URL</label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail (optional)</label>
              <div {...getRootProps()} className="p-4 border-2 border-dashed rounded-lg bg-white dark:bg-gray-800 text-center cursor-pointer">
                <input {...getInputProps()} />
                {isDragActive ? <p>Drop image here...</p> : <p>Drag & drop an image, or click to select</p>}
              </div>
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="mt-4 w-32 h-32 rounded-lg object-cover"
                />
              )}
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={chatEnabled}
                  onChange={() => setChatEnabled(!chatEnabled)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Enable Live Chat</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Private Stream</span>
              </label>
            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-3 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {starting ? 'Starting...' : 'Start Live Stream'}
            </button>
          </div>
          <ToastContainer />
        </main>
      </div>
    </div>
  );
};

export default LivePage;
