'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { 
  FiSearch, 
  FiFilter, 
  FiFlag, 
  FiTrash2,
  FiEye,
  FiPlayCircle,
  FiHeart,
  FiMessageCircle,
} from 'react-icons/fi';
import { formatCount } from '@/app/utils/formatCount';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: 'video' | 'short';
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration: number;
  createdAt: string;
  flagged: boolean;
  flagReason?: string;
  status: 'active' | 'flagged' | 'removed';
}

interface ContentManagementProps {
  userRole: string;
}

export default function ContentManagement({ userRole }: ContentManagementProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContent, setTotalContent] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    flagged: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.flagged && { flagged: filters.flagged }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content?${queryParams}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setContent(data.data.content);
      setTotalPages(data.data.totalPages);
      setTotalContent(data.data.totalContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchTerm]);

  useEffect(() => {
    void fetchContent();
  }, [fetchContent]);

  const handleFlagContent = async (contentId: string, contentType: 'video' | 'short') => {
    const reason = prompt('Enter flag reason:');
    if (!reason) return;

    try {
      setActionLoading(contentId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/${contentId}/flag`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({ contentType, reason })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to flag content');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchContent();
    } catch (error) {
      console.error('Error flagging content:', error);
      toast.error('Failed to flag content');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveContent = async (contentId: string, contentType: 'video' | 'short') => {
    if (!['admin', 'super_admin'].includes(userRole)) {
      toast.error('Insufficient permissions');
      return;
    }

    if (!confirm('Are you sure you want to remove this content? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(contentId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content/${contentId}/remove`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({ contentType })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove content');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchContent();
    } catch (error) {
      console.error('Error removing content:', error);
      toast.error('Failed to remove content');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'flagged': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'removed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatCount(totalContent)} total content items
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="short">Shorts</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="removed">Removed</option>
            </select>

            <select
              value={filters.flagged}
              onChange={(e) => setFilters({ ...filters, flagged: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Content</option>
              <option value="true">Flagged Only</option>
              <option value="false">Not Flagged</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-video.png';
                      }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                      <FiPlayCircle className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(item.duration)}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'video' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {item.type === 'video' ? 'Video' : 'Short'}
                      </span>
                    </div>
                    {item.flagged && (
                      <div className="absolute top-2 right-2">
                        <FiFlag className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Image
                        src={item.author.avatar || '/placeholder.png'}
                        alt={item.author.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.author.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {formatCount(item.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiHeart className="w-4 h-4" />
                        {formatCount(item.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMessageCircle className="w-4 h-4" />
                        {formatCount(item.comments)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {item.flagged && item.flagReason && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 mb-4">
                        <p className="text-xs text-yellow-800 dark:text-yellow-400">
                          <strong>Flag Reason:</strong> {item.flagReason}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // setSelectedContent(item);
                          // setShowContentModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-sm"
                      >
                        View
                      </button>
                      
                      {!item.flagged && (
                        <button
                          onClick={() => handleFlagContent(item.id, item.type)}
                          disabled={actionLoading === item.id}
                          className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors text-sm disabled:opacity-50"
                        >
                          <FiFlag className="w-4 h-4" />
                        </button>
                      )}
                      
                      {['admin', 'super_admin'].includes(userRole) && (
                        <button
                          onClick={() => handleRemoveContent(item.id, item.type)}
                          disabled={actionLoading === item.id}
                          className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm disabled:opacity-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}