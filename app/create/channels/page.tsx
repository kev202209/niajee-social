'use client';

import React, { useEffect, useState, FC } from 'react';
import axios from 'axios';
import { Channel } from '@/types'; // define Channel type in types

const ChannelsPage: FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get<Channel[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/channels`
        );
        setChannels(res.data);
      } catch (err: any) {
        setError('Failed to load channels.');
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-6 overflow-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Channels</h1>
        </header>
        {loading ? (
          <p>Loading channels...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((ch) => (
              <div
                key={ch._id}
                className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg flex flex-col">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {ch.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {ch.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Subscribers: {ch.subscriberCount}
                  </span>
                  <button
                    onClick={() => handleManage(ch._id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const handleManage = (channelId: string) => {
  // navigate to manage page or open modal
  window.location.href = `/create/channels/${channelId}`;
};

export default ChannelsPage;
