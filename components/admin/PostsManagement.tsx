'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { 
  FiSearch, 
  FiFilter, 
  FiMessageSquare, 
  FiEye,
  FiFlag,
  FiTrash2,
  FiStar,
  FiHeart,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi';
import { formatCount } from '@/utils/formatCount';
import { getImageSrcSafe } from '@/types';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';

interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  community: {
    id: string;
    name: string;
    slug: string;
  };
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  sensitive: boolean;
  featured: boolean;
  published: boolean;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PostsManagementProps {
  userRole: string;
}

export default function PostsManagement({ userRole }: PostsManagementProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [filters, setFilters] = useState({
    sensitive: '',
    featured: '',
    published: '',
    communityId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // wrap fetchPosts so its identity is stable for useEffect deps
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.sensitive && { sensitive: filters.sensitive }),
        ...(filters.featured && { featured: filters.featured }),
        ...(filters.published && { published: filters.published }),
        ...(filters.communityId && { communityId: filters.communityId }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts?${queryParams}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.data.posts);
      setTotalPages(data.data.pagination.totalPages);
      setTotalPosts(data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    filters.sensitive,
    filters.featured,
    filters.published,
    filters.communityId
  ]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const handleFlagPost = async (postId: string, reason: string) => {
    try {
      setActionLoading(postId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts/${postId}/flag`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({ reason })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to flag post');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchPosts();
    } catch (error) {
      console.error('Error flagging post:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemovePost = async (postId: string) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      toast.error('Insufficient permissions');
      return;
    }

    try {
      setActionLoading(postId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts/${postId}/remove`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove post');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchPosts();
    } catch (error) {
      console.error('Error removing post:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeaturePost = async (postId: string) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      toast.error('Insufficient permissions');
      return;
    }

    try {
      setActionLoading(postId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts/${postId}/feature`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to feature post');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchPosts();
    } catch (error) {
      console.error('Error featuring post:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfeaturePost = async (postId: string) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      toast.error('Insufficient permissions');
      return;
    }

    try {
      setActionLoading(postId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/posts/${postId}/feature`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unfeature post');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchPosts();
    } catch (error) {
      console.error('Error unfeaturing post:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setActionLoading(null);
    }
  };

  const PostModal = ({ post, onClose }: { post: Post; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Post Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {post.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {post.content}
            </p>
          </div>
          
          {post.images && post.images.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Images</h5>
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, index) => {
                  const imageSrc = getImageSrcSafe(image, '480w');
                  return imageSrc ? (
                    <Image
                      key={`post-image-${index}`}
                      src={imageSrc}
                      alt={`Post image ${index + 1}`}
                      width={400}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.png';
                      }}
                    />
                  ) : (
                    <div key={`post-image-placeholder-${index}`} className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Author</h5>
              <div className="flex items-center gap-2">
                <Image
                  src={getImageSrcSafe(post.author.avatar, '480w') || '/placeholder.png'}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.png';
                  }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {post.author.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    @{post.author.username}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Community</h5>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {post.community.name}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Stats</h5>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Views:</span>
                  <span>{formatCount(post.views)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Likes:</span>
                  <span>{formatCount(post.likes)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comments:</span>
                  <span>{formatCount(post.comments)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shares:</span>
                  <span>{formatCount(post.shares)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Status</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${post.published ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${post.featured ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {post.featured ? 'Featured' : 'Not Featured'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${post.sensitive ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {post.sensitive ? 'Sensitive' : 'Safe'}
                  </span>
                </div>
              </div>
            </div>
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
            Posts Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatCount(totalPosts)} total posts
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
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={filters.published}
              onChange={(e) => setFilters({ ...filters, published: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
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

            <select
              value={filters.sensitive}
              onChange={(e) => setFilters({ ...filters, sensitive: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Content</option>
              <option value="true">Sensitive</option>
              <option value="false">Safe</option>
            </select>

            <input
              type="text"
              placeholder="Community ID"
              value={filters.communityId}
              onChange={(e) => setFilters({ ...filters, communityId: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : (
          posts.map((post) => {
            const firstImageSrc = post.images && post.images.length > 0 ? getImageSrcSafe(post.images[0], '480w') : null;
            const authorAvatarSrc = getImageSrcSafe(post.author.avatar, '480w') || '/placeholder.png';
            
            return (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                {firstImageSrc && (
                  <Image
                    src={firstImageSrc}
                    alt={post.title}
                    width={600}
                    height={192}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.png';
                    }}
                  />
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {post.featured && (
                        <FiStar className="w-4 h-4 text-yellow-500" />
                      )}
                      {post.sensitive && (
                        <FiAlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      {post.flagged && (
                        <FiFlag className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Image
                      src={authorAvatarSrc}
                      alt={post.author.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.png';
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.author.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {post.community.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FiHeart className="w-4 h-4" />
                        {formatCount(post.likes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMessageSquare className="w-4 h-4" />
                        {formatCount(post.comments)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {formatCount(post.views)}
                      </div>
                    </div>
                    <div className="text-xs">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowPostModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          const reason = prompt('Enter flag reason:');
                          if (reason) handleFlagPost(post.id, reason);
                        }}
                        disabled={actionLoading === post.id}
                        className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50"
                      >
                        <FiFlag className="w-4 h-4" />
                      </button>
                      
                      {['ADMIN', 'SUPER_ADMIN'].includes(userRole) && (
                        <>
                          <button
                            onClick={() => post.featured ? handleUnfeaturePost(post.id) : handleFeaturePost(post.id)}
                            disabled={actionLoading === post.id}
                            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50"
                          >
                            <FiStar className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to remove this post?')) {
                                handleRemovePost(post.id);
                              }
                            }}
                            disabled={actionLoading === post.id}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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

      {/* Post Modal */}
      {showPostModal && selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => {
            setShowPostModal(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
}