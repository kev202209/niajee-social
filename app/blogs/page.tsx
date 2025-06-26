"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/watch/Header';
import Sidebar from '@/components/watch/Sidebar';
import BlogCard from './components/BlogCard';
import BlogSearch from './components/BlogSearch';
import BlogFilters from './components/BlogFilters';
import BlogSkeleton from './components/BlogSkeleton';
import Pagination from '@/components/blog/Pagination';
import { Blog, BlogFilterDto } from '@/types';
import { FiPlus, FiTrendingUp, FiStar, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = [
  'Technology',
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Science',
  'Health',
  'Lifestyle',
  'Travel',
  'Food',
  'Education',
  'Entertainment',
  'Other'
];

export default function BlogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'latest' | 'trending' | 'featured'>('latest');
  
  const [filters, setFilters] = useState<BlogFilterDto>({
    sortBy: 'latest',
    page: 1,
    limit: 12
  });

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const page = searchParams.get('page');
    
    setFilters(prev => ({
      ...prev,
      category: category || undefined,
      search: search || undefined,
      tags: tag ? [tag] : undefined,
      page: page ? parseInt(page) : 1
    }));
    
    setCurrentPage(page ? parseInt(page) : 1);
  }, [searchParams]);

  // Fetch blogs when filters change
  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  // Fetch featured blogs on mount
  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.tags?.length) queryParams.append('tags', filters.tags.join(','));
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      queryParams.append('page', filters.page?.toString() || '1');
      queryParams.append('limit', filters.limit?.toString() || '12');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data.blogs || []);
        setTotalPages(data.data.totalPages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch blogs');
      }
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      setFeaturedLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/featured?limit=5`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch featured blogs');
      }

      const data = await response.json();
      
      if (data.success) {
        setFeaturedBlogs(data.data.blogs || []);
      }
    } catch (err: any) {
      console.error('Error fetching featured blogs:', err);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    setCurrentPage(1);
    updateURL({ search: searchTerm, page: 1 });
  };

  const handleFilterChange = (newFilters: Partial<BlogFilterDto>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    setCurrentPage(1);
    updateURL(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    setCurrentPage(page);
    updateURL({ page });
  };

  const handleTabChange = (tab: 'latest' | 'trending' | 'featured') => {
    setActiveTab(tab);
    if (tab === 'featured') {
      // Show featured blogs
      return;
    }
    
    const sortBy = tab === 'trending' ? 'trending' : 'latest';
    handleFilterChange({ sortBy });
  };

  const updateURL = (params: any) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const newURL = searchParams.toString() ? `?${searchParams.toString()}` : '';
    router.push(`/blogs${newURL}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({ sortBy: 'latest', page: 1, limit: 12 });
    setCurrentPage(1);
    router.push('/blogs');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar isOpen={false} onClose={() => {}} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Discover Amazing Blogs
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Read, learn, and share knowledge with our community
              </p>
            </div>
            
            {user && (
              <Link
                href="/blogs/create"
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Write a Blog
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <BlogSearch onSearch={handleSearch} initialValue={filters.search} />
            <BlogFilters
              categories={CATEGORIES}
              onFilterChange={handleFilterChange}
              currentFilters={filters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange('latest')}
                className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'latest'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiClock className="w-4 h-4" />
                <span>Latest</span>
              </button>
              
              <button
                onClick={() => handleTabChange('trending')}
                className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'trending'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiTrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </button>
              
              <button
                onClick={() => handleTabChange('featured')}
                className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'featured'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FiStar className="w-4 h-4" />
                <span>Featured</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'featured' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Blogs</h2>
              {featuredLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <BlogSkeleton key={i} />
                  ))}
                </div>
              ) : featuredBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} featured />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No featured blogs available</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">{error}</div>
                  <button
                    onClick={fetchBlogs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <BlogSkeleton key={i} />
                  ))}
                </div>
              ) : blogs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {blogs.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    No blogs found {filters.search && `for "${filters.search}"`}
                  </div>
                  {(filters.search || filters.category || filters.tags?.length) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}