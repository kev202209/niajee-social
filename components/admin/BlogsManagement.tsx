'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FiSearch, 
  FiFilter, 
  FiUser, 
  FiCalendar,
  FiEye,
  FiFlag,
  FiTrash2,
  FiEdit3,
  FiClock,
  FiBookOpen,
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiX
} from 'react-icons/fi';
import { formatCount } from '@/app/utils/formatCount';

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  readTime: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  sensitive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface BlogReport {
  id: string;
  blog: Blog;
  reporter: {
    id: string;
    name: string;
    username: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface BlogsManagementProps {
  userRole: string;
}

export default function BlogsManagement({ userRole }: BlogsManagementProps) {
  const [activeTab, setActiveTab] = useState<'blogs' | 'reports'>('blogs');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [reports, setReports] = useState<BlogReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    featured: '',
    category: ''
  });
  const [reportFilters, setReportFilters] = useState({
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [selectedReport, setSelectedReport] = useState<BlogReport | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'blogs') {
      fetchBlogs();
    } else {
      fetchReports();
    }
  }, [activeTab, currentPage, filters, reportFilters, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.featured && { featured: filters.featured }),
        ...(filters.category && { category: filters.category }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs?${queryParams}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data = await response.json();
      const mappedBlogs = data.data.blogs.map((b: any) => ({
        id: b.id,
        title: b.title,
        content: b.content ?? '',
        excerpt: b.excerpt ?? '',
        featuredImage: b.featuredImage ?? '',
        author: {
          id: b.authorId ?? '',
          name: b.authorUsername ?? '',
          username: b.authorUsername ?? '',
          avatar: b.authorAvatar ?? '',
        },
        category: {
          id: b.categoryId ?? '',
          name: b.categoryName ?? '',
          slug: b.categorySlug ?? '',
        },
        tags: b.tags ?? [],
        likes: b.likeCount ?? 0,
        comments: b.commentCount ?? 0,
        shares: b.shareCount ?? 0,
        views: b.viewCount ?? 0,
        readTime: b.readTime ?? 0,
        status: b.status ?? 'draft',
        featured: b.isFeatured ?? false,
        sensitive: b.isSensitive ?? false,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt ?? '',
        publishedAt: b.publishedAt ?? '',
      }));
      setBlogs(mappedBlogs);
      setTotalPages(data.data.pagination.totalPages ?? 1);
      setTotalItems(data.data.pagination.total ?? mappedBlogs.length);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(reportFilters.status && { status: reportFilters.status }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/blog-reports?${queryParams}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch blog reports');
      }

      const data = await response.json();
      setReports(data.data.reports);
      setTotalPages(data.data.pagination.totalPages);
      setTotalItems(data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching blog reports:', error);
      toast.error('Failed to load blog reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: string, reviewNotes?: string) => {
    try {
      setActionLoading(reportId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/blog-reports/${reportId}/status`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({ status, reviewNotes })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchReports();
      setShowReportModal(false);
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const BlogModal = ({ blog, onClose }: { blog: Blog; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Blog Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX /></button>
        </div>
        <div className="p-6 space-y-6">
          {blog.featuredImage && (
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
          
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {blog.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {blog.excerpt}
            </p>
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Author</h5>
              <div className="flex items-center gap-3">
                <img
                  src={blog.author.avatar || '/placeholder.png'}
                  alt={blog.author.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {blog.author.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{blog.author.username}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Category</h5>
              <div className="text-gray-600 dark:text-gray-400">
                {blog.category.name}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Stats</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Views:</span>
                  <span className="text-gray-900 dark:text-white">{formatCount(blog.views)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Likes:</span>
                  <span className="text-gray-900 dark:text-white">{formatCount(blog.likes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Comments:</span>
                  <span className="text-gray-900 dark:text-white">{formatCount(blog.comments)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Read Time:</span>
                  <span className="text-gray-900 dark:text-white">{blog.readTime} min</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Tags</h5>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportModal = ({ report, onClose }: { report: BlogReport; onClose: () => void }) => (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Report Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Reported Blog
            </h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white">
                {report.blog.title}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                by {report.blog.author.name}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Report Details
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason:
                </label>
                <p className="text-gray-900 dark:text-white">{report.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description:
                </label>
                <p className="text-gray-900 dark:text-white">{report.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reporter:
                </label>
                <p className="text-gray-900 dark:text-white">
                  {report.reporter.name} (@{report.reporter.username})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reported On:
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          {report.reviewNotes && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Review Notes
              </h4>
              <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {report.reviewNotes}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const notes = prompt('Enter review notes (optional):');
                handleUpdateReportStatus(report.id, 'reviewed', notes || undefined);
              }}
              disabled={actionLoading === report.id}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Mark as Reviewed
            </button>
            <button
              onClick={() => {
                const notes = prompt('Enter resolution notes (optional):');
                handleUpdateReportStatus(report.id, 'resolved', notes || undefined);
              }}
              disabled={actionLoading === report.id}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blogs Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatCount(totalItems)} total {activeTab}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'blogs'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Blogs
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Reports
            </button>
          </div>
          
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
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {activeTab === 'blogs' ? (
              <>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={filters.featured}
                  onChange={(e) => setFilters({ ...filters, featured: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Featured</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>

                <input
                  type="text"
                  placeholder="Category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </>
            ) : (
              <select
                value={reportFilters.status}
                onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'blogs' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                {blog.featuredImage && (
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {blog.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(blog.status)}`}>
                      {blog.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={blog.author.avatar || '/placeholder.png'}
                      alt={blog.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {blog.author.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {blog.category.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {formatCount(blog.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiHeart className="w-4 h-4" />
                        {formatCount(blog.likes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {blog.readTime}m
                      </div>
                    </div>
                    <div className="text-xs">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {blog.featured && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                          Featured
                        </span>
                      )}
                      {blog.sensitive && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                          Sensitive
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedBlog(blog);
                        setShowBlogModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Blog & Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {report.blog.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Reported by {report.reporter.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {report.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowReportModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showBlogModal && selectedBlog && (
        <BlogModal blog={selectedBlog} onClose={() => setShowBlogModal(false)} />
      )}
      {showReportModal && selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}