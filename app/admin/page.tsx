'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FiShield } from 'react-icons/fi';
import AdminSidebar, { type AdminSidebarStats } from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import ReportsManagement from '@/components/admin/ReportsManagement';
import ContactsManagement from '@/components/admin/ContactsManagement';
import PostsManagement from '@/components/admin/PostsManagement';
import BlogsManagement from '@/components/admin/BlogsManagement';
import Analytics from '@/components/admin/Analytics';

// Full dashboard stats (renamed to avoid confusion with sidebar stats)
interface FullDashboardStats {
  overview: {
    totalUsers: number;
    totalContent: number;
    totalVideos: number;
    totalShorts: number;
    totalPosts: number;
    totalBlogs: number;
    totalChannels: number;
    totalCommunities: number;
    totalContacts: number;
  };
  engagement: {
    totalViews: string;
    totalVideoViews: string;
    totalShortViews: string;
    totalBlogViews: string;
    totalLikes: string;
    totalShares: string;
    totalComments: number;
    avgEngagementRate: number;
  };
  users: {
    total: number;
    active: number;
    verified: number;
    suspended: number;
    banned: number;
    private: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growthWeekPercent: number;
    growthMonthPercent: number;
    activityRate: number;
  };
  content: {
    totalActive: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
    flagged: number;
    featured: number;
    growthWeekPercent: number;
  };
  moderation: {
    pendingReports: number;
    pendingVideoReports: number;
    pendingShortReports: number;
    pendingPostReports: number;
    pendingBlogReports: number;
    resolvedToday: number;
    flaggedContent: number;
    hiddenComments: number;
    inactiveContent: number;
  };
  system: {
    unprocessedContacts: number;
    serverUptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    timestamp: string;
  };
  topPerformers: {
    videos: Array<{
      id: string;
      title: string;
      viewCount: number;
      channelName: string;
      ownerUsername: string;
    }>;
    shorts: Array<{
      id: string;
      title: string;
      viewCount: number;
      channelName: string;
      ownerUsername: string;
    }>;
    posts: Array<{
      id: string;
      content?: string;
      author?: string;
      likesCount?: number;
      commentsCount?: number;
    }>;
    blogs: Array<{
      id: string;
      title: string;
      viewCount: number;
      authorUsername: string;
    }>;
    users: Array<{
      id: string;
      username?: string;
      displayName?: string;
      followerCount?: number;
      videoCount?: number;
    }>;
  };
  alerts: {
    criticalIssues: Array<{
      id: string;
      message: string;
      severity?: 'critical' | 'warning' | 'info';
      createdAt?: string;
    }>;
    pendingReports: number;
    unprocessedContacts: number;
    flaggedContent: number;
  };
  channels: {
    total: number;
    verified: number;
    monetized: number;
    verificationRate: number;
    monetizationRate: number;
  };
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<FullDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data.data as FullDashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      toast.error('Something went wrong. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/register');
      return;
    }
    if (!['moderator', 'admin', 'super_admin'].includes(user.role)) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }
    void fetchDashboardStats();
  }, [user, router, authLoading, fetchDashboardStats]);

  // Derive the lightweight stats object needed by AdminSidebar
  const sidebarStats: AdminSidebarStats | undefined = stats
    ? ({
        totalUsers: stats.overview.totalUsers,
        totalContent: stats.overview.totalContent,
        pendingReports: stats.moderation.pendingReports,
        flaggedContent: stats.moderation.flaggedContent,
        unprocessedContacts: stats.system.unprocessedContacts
      } as AdminSidebarStats)
    : undefined;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard stats={stats} loading={loading} />;
      case 'users':
        return <UserManagement userRole={user?.role ?? ''} />;
      case 'content':
        return <ContentManagement userRole={user?.role ?? ''} />;
      case 'reports':
        return <ReportsManagement userRole={user?.role ?? ''} />;
      case 'contacts':
        return <ContactsManagement userRole={user?.role ?? ''} />;
      case 'posts':
        return <PostsManagement userRole={user?.role ?? ''} />;
      case 'blogs':
        return <BlogsManagement userRole={user?.role ?? ''} />;
      case 'analytics':
        return <Analytics userRole={user?.role ?? ''} />;
      default:
        return <AdminDashboard stats={stats} loading={loading} />;
    }
  };

  if (!user || !['moderator', 'admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiShield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={user.role}
          stats={sidebarStats}
        />
        <div className="flex-1 lg:ml-64">
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {activeTab === 'dashboard' ? 'Admin Dashboard' : activeTab.replace('-', ' ')}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Role: {user.role}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}