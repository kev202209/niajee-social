'use client';

import { useState } from 'react';
import { 
  FiUsers, 
  FiVideo, 
  FiFlag, 
  FiMail, 
  FiFileText, 
  FiMessageSquare,
  FiBarChart,
  FiHome,
  FiMenu,
  FiX,
  FiAlertCircle,
  FiBook
} from 'react-icons/fi';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  stats: any;
}

export default function AdminSidebar({ activeTab, setActiveTab, userRole, stats }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'users', label: 'Users', icon: FiUsers, roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'content', label: 'Videos & Shorts', icon: FiVideo, roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'posts', label: 'Posts', icon: FiMessageSquare, roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'blogs', label: 'Blogs', icon: FiBook, roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'reports', label: 'Reports', icon: FiFlag, roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'contacts', label: 'Contacts', icon: FiMail, roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart, roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const getBadgeCount = (itemId: string) => {
    if (!stats) return 0;
    
    switch (itemId) {
      case 'reports':
        return stats.pendingReports || 0;
      case 'contacts':
        return stats.unprocessedContacts || 0;
      default:
        return 0;
    }
  };

  const SidebarContent = () => (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Mosaic Social
        </p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          if (!item.roles.includes(userRole)) return null;
          
          const isActive = activeTab === item.id;
          const badgeCount = getBadgeCount(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              
              {badgeCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="relative flex flex-col w-64 h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        <SidebarContent />
      </div>
    </>
  );
}