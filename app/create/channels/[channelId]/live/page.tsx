'use client';

import React, { useState, useEffect, FC } from 'react';
import { useParams } from 'next/navigation';
import { Channel } from '@/types';
import { FiRadio, FiPlay, FiSquare, FiSettings, FiUsers, FiEye, FiCopy, FiLoader, FiMonitor, FiClock } from 'react-icons/fi';

interface LiveStreamSettings {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'unlisted' | 'private';
  chatEnabled: boolean;
  recordStream: boolean;
}

interface StreamStats {
  viewers: number;
  duration: string;
  bitrate: string;
  resolution: string;
}

const ChannelLivePage: FC = () => {
  const params = useParams();
  const channelId = params.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [settings, setSettings] = useState<LiveStreamSettings>({
    title: '',
    description: '',
    category: '',
    visibility: 'public',
    chatEnabled: true,
    recordStream: false,
  });

  const [streamStats, setStreamStats] = useState<StreamStats>({
    viewers: 0,
    duration: '00:00:00',
    bitrate: '0 kbps',
    resolution: '1920x1080',
  });

  const [streamKey] = useState('sk_live_' + Math.random().toString(36).substr(2, 20));
  const [streamUrl] = useState(`rtmp://live.mosaic-social.com/live/${channelId}`);

  const categories = [
    'Gaming', 'Education', 'Entertainment', 'Music', 'Sports', 
    'Technology', 'Comedy', 'News', 'Lifestyle', 'Travel', 'Other'
  ];

  useEffect(() => {
    fetchChannel();
    checkLiveStatus();
    
    // Cleanup function
    return () => {
      if ((window as any).liveStatsInterval) {
        clearInterval((window as any).liveStatsInterval);
      }
    };
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setChannel(data.channel || data);
        
        // Pre-fill title with channel name
        setSettings(prev => ({
          ...prev,
          title: `${(data.channel || data).name} Live Stream`
        }));
      } else {
        setError('Failed to load channel data');
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
      setError('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  };

  const checkLiveStatus = async () => {
    try {
      // This would check your backend for current live status
      // For now, we'll simulate it
      setIsLive(false);
    } catch (error) {
      console.error('Error checking live status:', error);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const startLiveStream = async () => {
    if (!settings.title.trim()) {
      setError('Please enter a stream title');
      return;
    }

    setStarting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isLive: true,
          streamSettings: settings,
        }),
      });

      if (response.ok) {
        setIsLive(true);
        setSuccess('Live stream started successfully!');
        startStatsUpdates();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to start live stream');
      }
    } catch (error) {
      console.error('Error starting live stream:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const stopLiveStream = async () => {
    setStopping(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isLive: false,
        }),
      });

      if (response.ok) {
        setIsLive(false);
        setSuccess('Live stream ended successfully!');
        stopStatsUpdates();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to stop live stream');
      }
    } catch (error) {
      console.error('Error stopping live stream:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setStopping(false);
    }
  };

  const startStatsUpdates = () => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const duration = new Date(now - startTime);
      const hours = Math.floor(duration.getTime() / (1000 * 60 * 60));
      const minutes = Math.floor((duration.getTime() % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((duration.getTime() % (1000 * 60)) / 1000);
      
      setStreamStats(prev => ({
        ...prev,
        viewers: Math.floor(Math.random() * 50) + 1,
        duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        bitrate: Math.floor(Math.random() * 1000 + 2000) + ' kbps',
        resolution: '1920x1080',
      }));
    }, 1000);

    (window as any).liveStatsInterval = interval;
  };

  const stopStatsUpdates = () => {
    if ((window as any).liveStatsInterval) {
      clearInterval((window as any).liveStatsInterval);
      delete (window as any).liveStatsInterval;
    }
    
    setStreamStats({
      viewers: 0,
      duration: '00:00:00',
      bitrate: '0 kbps',
      resolution: '1920x1080',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <FiRadio className="w-8 h-8" />
              Live Streaming
              {isLive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isLive ? 'Your stream is currently live' : 'Start your live stream to connect with your audience'}
            </p>
          </div>
          
          {!isLive ? (
            <button
              onClick={startLiveStream}
              disabled={starting}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
            >
              {starting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4" />
                  Go Live
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopLiveStream}
              disabled={stopping}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
            >
              {stopping ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <FiSquare className="w-4 h-4" />
                  End Stream
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stream Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiSettings className="w-5 h-5" />
              Stream Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stream Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={settings.title}
                  onChange={handleSettingsChange}
                  placeholder="Enter your stream title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={isLive}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={settings.description}
                  onChange={handleSettingsChange}
                  placeholder="Tell viewers what your stream is about"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  disabled={isLive}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={settings.category}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={isLive}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={settings.visibility}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={isLive}
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="chatEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Chat
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow viewers to chat during the stream
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="chatEnabled"
                    name="chatEnabled"
                    checked={settings.chatEnabled}
                    onChange={handleSettingsChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLive}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="recordStream" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Record Stream
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Save the stream for later viewing
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="recordStream"
                    name="recordStream"
                    checked={settings.recordStream}
                    onChange={handleSettingsChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLive}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stream Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Stream Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stream URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={streamUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                  <button
                    onClick={() => copyToClipboard(streamUrl)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Copy stream URL"
                  >
                    <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stream Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={streamKey}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                  <button
                    onClick={() => copyToClipboard(streamKey)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Copy stream key"
                  >
                    <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Keep your stream key private. Do not share it with anyone.
                </p>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Setup Instructions
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Using OBS Studio:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Open OBS Studio</li>
                  <li>Go to Settings → Stream</li>
                  <li>Select "Custom..." as Service</li>
                  <li>Copy and paste the Stream URL above</li>
                  <li>Copy and paste the Stream Key above</li>
                  <li>Click "Start Streaming" in OBS</li>
                  <li>Then click "Go Live" here</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recommended Settings:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Video: 1920x1080 at 30fps</li>
                  <li>Bitrate: 2500-4000 kbps</li>
                  <li>Encoder: x264 or Hardware encoder</li>
                  <li>Audio: 128 kbps AAC</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Stats */}
          {isLive && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiEye className="w-5 h-5" />
                Live Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Viewers</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <FiUsers className="w-4 h-4" />
                    {streamStats.viewers}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    {streamStats.duration}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bitrate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {streamStats.bitrate}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Resolution</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <FiMonitor className="w-4 h-4" />
                    {streamStats.resolution}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stream Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stream Preview
            </h3>
            
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {isLive ? (
                <div className="text-center">
                  <FiRadio className="w-12 h-12 text-red-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-red-600 dark:text-red-400 font-medium">Live Stream Active</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preview not available</p>
                </div>
              ) : (
                <div className="text-center">
                  <FiMonitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No stream active</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Start streaming to see preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/watch/${channelId}`)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition text-sm"
              >
                📋 Copy Stream Link
              </button>
              
              <button
                onClick={() => window.open(`${window.location.origin}/watch/${channelId}`, '_blank')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition text-sm"
              >
                👁️ View Stream
              </button>
              
              <button
                onClick={() => window.open('/create/channels/' + channelId + '/analytics', '_blank')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition text-sm"
              >
                📊 View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg shadow-lg">
          <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg shadow-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ChannelLivePage;