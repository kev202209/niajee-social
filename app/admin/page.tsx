'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  FiUsers, 
  FiVideo, 
  FiFlag, 
  FiMail, 
  FiFileText, 
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiEye
} from 'react-icons/fi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import ReportsManagement from '@/components/admin/ReportsManagement';
import ContactsManagement from '@/components/admin/ContactsManagement';
import PostsManagement from '@/components/admin/PostsManagement';
import BlogsManagement from '@/components/admin/BlogsManagement';
import Analytics from '@/components/admin/Analytics';

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

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    // Check if user has admin privileges
    if (!['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }

    fetchDashboardStats();
  }, [user, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  if (!user || !['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiShield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
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
          stats={stats}
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
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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