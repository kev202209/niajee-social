'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/home/header';
import Sidebar from '@/components/home/sidebar';
import { FiSearch, FiTrendingUp, FiUsers, FiVideo, FiPlay, FiHash, FiGrid } from 'react-icons/fi';
import AuthenticatedImage from '@/components/Image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getFullUrl } from '@/app/utils/videourl';
import timeAgo from '@/app/utils/timeAgo';
import { formatCount } from '@/app/utils/formatCount';

interface SearchResult {
  id: string;
  type: 'user' | 'video' | 'short' | 'channel' | 'post' | 'blog';
  title?: string;
  description?: string;
  thumbnail?: string;
  avatar?: string;
  username?: string;
  displayName?: string;
  channelName?: string;
  views?: number;
  duration?: string;
  createdAt?: string;
  verified?: boolean;
  followerCount?: number;
  videoCount?: number;
  isFollowing?: boolean;
  handle?: string;
  content?: string;
}

interface TrendingItem {
  id: string;
  term: string;
  count: number;
  category?: string;
}

const SEARCH_TYPES = [
  { key: 'top', label: 'Top', icon: FiTrendingUp },
  { key: 'latest', label: 'Latest', icon: FiSearch },
  { key: 'videos', label: 'Videos', icon: FiVideo },
  { key: 'shorts', label: 'Shorts', icon: FiPlay },
  { key: 'channels', label: 'Channels', icon: FiUsers },
  { key: 'people', label: 'People', icon: FiUsers },
  { key: 'blogs', label: 'Blogs', icon: FiHash }, // Added blogs
  { key: 'all', label: 'All', icon: FiGrid },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'top';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Format functions for different result types
  const formatUsers = (users: any[]): SearchResult[] => {
    return users.map(user => ({
      id: user.id,
      type: 'user' as const,
      title: user.displayName || user.username,
      username: user.username,
      displayName: user.displayName,
      avatar: user.profilePic,
      verified: user.verified,
      followerCount: user.followerCount || 0,
    }));
  };

  const formatChannels = (channels: any[]): SearchResult[] => {
    return channels.map(channel => ({
      id: channel.id,
      type: 'channel' as const,
      title: channel.name,
      username: channel.handle,
      displayName: channel.name,
      avatar: channel.avatar,
      verified: channel.verified,
      followerCount: channel.followerCount || 0,
      videoCount: channel.videoCount || 0,
      handle: channel.handle,
    }));
  };

  const formatVideos = (videos: any[]): SearchResult[] => {
    return videos.map(video => ({
      id: video.id || video.videoId,
      type: 'video' as const,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail || video.thumbnailUrl,
      views: video.views || video.viewCount,
      duration: video.duration,
      createdAt: video.createdAt || video.publishedAt,
      channelName: video.channel?.name || video.channelName,
      verified: video.channel?.verified || false,
    }));
  };

  const formatShorts = (shorts: any[]): SearchResult[] => {
    return shorts.map(short => ({
      id: short.id,
      type: 'short' as const,
      title: short.title,
      description: short.caption || short.description,
      thumbnail: short.thumbnailUrl || short.thumbnail,
      views: short.views || short.viewCount,
      createdAt: short.createdAt || short.publishedAt,
      channelName: short.channel?.name || short.channelName,
      verified: short.channel?.verified || false,
    }));
  };

  const formatPosts = (posts: any[]): SearchResult[] => {
    return posts.map(post => ({
      id: post.id,
      type: 'post' as const,
      title: post.title || post.content?.substring(0, 50) + '...',
      description: post.content,
      content: post.content,
      createdAt: post.createdAt,
      username: post.user?.username || post.author?.username,
      displayName: post.user?.displayName || post.author?.displayName,
      avatar: post.user?.profilePic || post.author?.profilePic,
      verified: post.user?.verified || post.author?.verified,
    }));
  };

  const formatBlogs = (blogs: any[]): SearchResult[] => {
    return blogs.map(blog => ({
      id: blog.id,
      type: 'blog' as const,
      title: blog.title,
      description: blog.excerpt || blog.subtitle,
      createdAt: blog.publishedAt,
      username: blog.authorUsername,
      displayName: blog.authorDisplayName,
      avatar: blog.authorProfilePic,
      verified: blog.authorVerified,
    }));
  };

  const formatSearchResults = (results: any[], resultType: string): SearchResult[] => {
    switch (resultType) {
      case 'users':
      case 'people':
        return formatUsers(results);
      case 'channels':
        return formatChannels(results);
      case 'videos':
        return formatVideos(results);
      case 'shorts':
        return formatShorts(results);
      case 'posts':
        return formatPosts(results);
      case 'blogs': // Added blogs
        return formatBlogs(results);
      default:
        return results.map(item => ({
          id: item.id,
          type: item.type || 'post',
          title: item.title || item.name || item.displayName,
          description: item.description || item.content,
          ...item
        }));
    }
  };

  // Updated debounced search function with correct endpoint and response handling
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchType: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}&limit=20`,
          {
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();

        let searchResults: SearchResult[] = [];

        if (data.results) {
          // For comprehensive search (all types)
          if (typeof data.results === 'object' && !Array.isArray(data.results) && data.type === 'all') {
            searchResults = [
              ...formatUsers(data.results.users || []),
              ...formatChannels(data.results.channels || []),
              ...formatVideos(data.results.videos || []),
              ...formatShorts(data.results.shorts || []),
              ...formatPosts(data.results.posts || []),
              ...formatBlogs(data.results.blogs || []) // Added blogs
            ];
          } else if (Array.isArray(data.results)) {
            searchResults = formatSearchResults(data.results, data.type || searchType);
          }
        }

        setResults(searchResults);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Search when query or type changes
  useEffect(() => {
    if (query) {
      debouncedSearch(query, type);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [query, type, debouncedSearch]);

  // Load trending searches on mount with updated endpoint
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search/trending`,
          {
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Handle different possible response structures
          const trendingData = data.results || data.trending || data;
          setTrending(Array.isArray(trendingData) ? trendingData : []);
        }
      } catch (err) {
        console.error('Failed to load trending:', err);
      }
    };

    loadTrending();
  }, []);

  // Handle search type change
  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('type', newType);
    if (query) params.set('q', query);
    router.push(`/search?${params.toString()}`);
  };

  // Handle trending click
  const handleTrendingClick = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}&type=top`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex pt-16">
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          setIsExpanded={setIsSidebarExpanded} 
        />
        
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Search Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiSearch className="w-5 h-5 text-gray-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {query ? `Search results for "${query}"` : 'Search'}
                </h1>
              </div>

              {/* Search Type Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SEARCH_TYPES.map((searchType) => {
                  const Icon = searchType.icon;
                  return (
                    <button
                      key={searchType.key}
                      onClick={() => handleTypeChange(searchType.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        type === searchType.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {searchType.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* No Query - Show Trending */}
            {!query && !loading && (
              <div className="space-y-6">
                <TrendingSection trending={trending} onTrendingClick={handleTrendingClick} />
              </div>
            )}

            {/* Search Results */}
            {query && hasSearched && !loading && (
              <div className="space-y-4">
                {results.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Found {results.length} results
                    </p>
                    <SearchResults results={results} type={type} />
                  </>
                ) : (
                  <NoResults query={query} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Updated Individual Search Result Item with better handling
function SearchResultItem({ result }: { result: SearchResult }) {
  const getResultLink = () => {
    switch (result.type) {
      case 'video':
        return `/watch/${result.id}`;
      case 'short':
        return `/shorts/${result.id}`;
      case 'channel':
        return `/channel/${result.handle || result.username || result.id}`;
      case 'user':
        return `/profile/${result.username || result.id}`;
      case 'post':
        // External frontend link for posts
        return `${process.env.NEXT_PUBLIC_FRONTEND_B_URL}/${result.username || 'user'}/status/${result.id}`;
      case 'blog':
        return `/blogs/${result.id}`;
      default:
        return '#';
    }
  };

  const getResultIcon = () => {
    switch (result.type) {
      case 'video':
        return <FiVideo className="w-4 h-4" />;
      case 'short':
        return <FiPlay className="w-4 h-4" />;
      case 'channel':
      case 'user':
        return <FiUsers className="w-4 h-4" />;
      case 'post':
      case 'blog':
        return <FiHash className="w-4 h-4" />;
      default:
        return <FiHash className="w-4 h-4" />;
    }
  };

  // Use <a> for posts to open in new tab, <Link> for internal links
  const linkProps =
    result.type === 'post'
      ? {
          href: getResultLink(),
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {
          href: getResultLink(),
        };

  return result.type === 'post' ? (
    <a {...linkProps}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {/* Avatar and content as before */}
          <div className="flex-shrink-0">
            {(result.type === 'video' || result.type === 'short') ? (
              <div className="relative w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                {result.thumbnail ? (
                  <AuthenticatedImage
                    mediaKey={result.thumbnail}
                    alt={result.title || ''}
                    fill
                    className="object-cover"
                    sizes="160px"
                    fallbackSrc="/placeholder-video.png"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getResultIcon()}
                  </div>
                )}
                {result.duration && (
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                    {result.duration}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {result.avatar ? (
                  <AuthenticatedImage
                    mediaKey={result.avatar}
                    alt={result.displayName || result.username || ''}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder.png"
                  />
                ) : (
                  getResultIcon()
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {result.title || result.displayName || result.username}
                </h3>
                
                {result.type === 'video' || result.type === 'short' ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.channelName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatCount(result.views || 0)} views</span>
                      <span>•</span>
                      <span>{timeAgo(result.createdAt || '')}</span>
                    </div>
                  </div>
                ) : result.type === 'post' ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by @{result.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(result.createdAt || '')}
                    </p>
                  </div>
                ) : result.type === 'blog' ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by {result.displayName || result.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(result.createdAt || '')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {result.username && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{result.username}
                      </p>
                    )}
                    {result.followerCount !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCount(result.followerCount)} {result.type === 'channel' ? 'subscribers' : 'followers'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full capitalize">
                  {result.type}
                </div>
                {result.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {result.description && result.type !== 'post' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {result.description}
              </p>
            )}
            
            {result.content && result.type === 'post' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-2">
                {result.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </a>
  ) : (
    <Link {...linkProps}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {/* Avatar and content as before */}
          <div className="flex-shrink-0">
            {result.type === 'video' || result.type === 'short' ? (
              <div className="relative w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                {result.thumbnail ? (
                  <AuthenticatedImage
                    mediaKey={result.thumbnail}
                    alt={result.title || ''}
                    fill
                    className="object-cover"
                    sizes="160px"
                    fallbackSrc="/placeholder-video.png"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getResultIcon()}
                  </div>
                )}
                {result.duration && (
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                    {result.duration}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {result.avatar ? (
                  <AuthenticatedImage
                    mediaKey={result.avatar}
                    alt={result.displayName || result.username || ''}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder.png"
                  />
                ) : (
                  getResultIcon()
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {result.title || result.displayName || result.username}
                </h3>
                
                {result.type === 'video' || result.type === 'short' ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.channelName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatCount(result.views || 0)} views</span>
                      <span>•</span>
                      <span>{timeAgo(result.createdAt || '')}</span>
                    </div>
                  </div>
                ) : result.type === 'post' ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by @{result.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(result.createdAt || '')}
                    </p>
                  </div>
                ) : result.type === 'blog' ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by {result.displayName || result.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(result.createdAt || '')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {result.username && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{result.username}
                      </p>
                    )}
                    {result.followerCount !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCount(result.followerCount)} {result.type === 'channel' ? 'subscribers' : 'followers'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full capitalize">
                  {result.type}
                </div>
                {result.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {result.description && result.type !== 'post' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {result.description}
              </p>
            )}
            
            {result.content && result.type === 'post' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-2">
                {result.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Trending Section Component
function TrendingSection({ trending, onTrendingClick }: { 
  trending: TrendingItem[]; 
  onTrendingClick: (term: string) => void; 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trending Searches</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {trending.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onTrendingClick(item.term)}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                #{index + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.term}</p>
                {item.category && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatCount(item.count)} searches
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Search Results Component
function SearchResults({ results, type }: { results: SearchResult[]; type: string }) {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
      ))}
    </div>
  );
}

// No Results Component
function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-12">
      <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No results found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We couldn't find anything for "{query}". Try a different search term.
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>Search tips:</p>
        <ul className="mt-2 space-y-1">
          <li>• Check your spelling</li>
          <li>• Try different keywords</li>
          <li>• Use more general terms</li>
        </ul>
      </div>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}