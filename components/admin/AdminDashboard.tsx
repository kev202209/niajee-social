'use client';

import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiVideo, 
  FiFlag, 
  FiMail, 
  FiFileText, 
  FiMessageSquare,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiBook
} from 'react-icons/fi';
import { formatCount } from '@/app/utils/formatCount';

interface DashboardStats {
  totalUsers: number;
  totalVideos: number;
  totalShorts: number;
  totalPosts: number;
  totalBlogs: number;
  pendingReports: number;
  unprocessedContacts: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

interface AdminDashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function AdminDashboard({ stats, loading }: AdminDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Total Videos',
      value: stats?.totalVideos || 0,
      icon: FiVideo,
      color: 'green',
      trend: '+8%'
    },
    {
      title: 'Total Shorts',
      value: stats?.totalShorts || 0,
      icon: FiVideo,
      color: 'purple',
      trend: '+15%'
    },
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FiMessageSquare,
      color: 'indigo',
      trend: '+5%'
    },
    {
      title: 'Total Blogs',
      value: stats?.totalBlogs || 0,
      icon: FiBook,
      color: 'orange',
      trend: '+3%'
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports || 0,
      icon: FiFlag,
      color: 'red',
      urgent: (stats?.pendingReports || 0) > 0
    },
    {
      title: 'Unprocessed Contacts',
      value: stats?.unprocessedContacts || 0,
      icon: FiMail,
      color: 'yellow',
      urgent: (stats?.unprocessedContacts || 0) > 0
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
      yellow: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
      indigo: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20',
      orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 ${
              card.urgent ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCount(card.value)}
                </p>
                {card.trend && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <FiTrendingUp className="w-3 h-3 mr-1" />
                    {card.trend}
                  </p>
                )}
                {card.urgent && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                    <FiAlertTriangle className="w-3 h-3 mr-1" />
                    Needs attention
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <FiClock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Manage Users</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage user accounts</p>
            </button>
            
            <button className="p-4 text-left bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <FiFlag className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Review Reports</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Handle pending reports</p>
            </button>
            
            <button className="p-4 text-left bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <FiMail className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Process Contacts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Respond to user inquiries</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}