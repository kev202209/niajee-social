'use client';

import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

// Define TypeScript interfaces for analytics data
interface SummaryStats {
  totalViews: number;
  totalWatchTime: number; // in minutes
  averageWatchTime: number; // in minutes
  videoCount: number;
}

interface TimeSeriesPoint {
  date: string;
  views: number;
  watchTime: number;
}

interface TopVideo {
  title: string;
  views: number;
}

interface AnalyticsResponse {
  summary: SummaryStats;
  timeSeries: TimeSeriesPoint[];
  topVideos: TopVideo[];
}

const AnalyticsPage: FC = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get<AnalyticsResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics`
        );
        setData(res.data);
      } catch (err) {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <p className="p-6">Loading analytics...</p>;
  }
  if (error || !data) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  const { summary, timeSeries, topVideos } = data;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Video Analytics</h1>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</h2>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.totalViews}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Videos Uploaded</h2>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.videoCount}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Watch Time</h2>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.totalWatchTime} min</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Watch Time</h2>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.averageWatchTime} min</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Views Over Time</h2>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart data={timeSeries} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Top Videos</h2>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={topVideos} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: 8 }} />
                  <Bar dataKey="views" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalyticsPage;