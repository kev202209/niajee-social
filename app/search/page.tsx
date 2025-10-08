'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import { FiSearch, FiTrendingUp, FiUsers, FiVideo, FiPlay, FiHash, FiGrid } from 'react-icons/fi';
import AuthenticatedImage from '@/components/Image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import timeAgo from '@/utils/timeAgo';
import { formatCount } from '@/utils/formatCount';
import type { User, Channel, mVideo, Short, Blog, Post, ProcessedImage } from '@/types';
import { getImageSrc } from '@/utils/imageUtils';

// ---- Updated Search Result Models with proper typing ----
interface UserResult {
  id: string;
  type: 'user';
  username?: string;
  displayName?: string | null;
  avatar?: ProcessedImage | string | null; // Updated to match ProcessedImage type
  verified?: boolean;
  followerCount?: number;
  createdAt?: string;
}

interface ChannelResult {
  id: string;
  type: 'channel';
  handle?: string;
  title?: string;
  displayName?: string;
  avatar?: ProcessedImage | string | null; // Updated to match ProcessedImage type
  verified?: boolean;
  followerCount?: number;
  videoCount?: number;
  createdAt?: string;
}

interface VideoResult {
  id: string;
  type: 'video';
  title?: string;
  description?: string;
  thumbnail?: ProcessedImage | string | null; // Updated to match ProcessedImage type
  views?: number;
  duration?: string | number;
  createdAt?: string;
  channelName?: string;
  verified?: boolean;
}

interface ShortResult {
  id: string;
  type: 'short';
  title?: string;
  description?: string;
  thumbnail?: ProcessedImage | string | null; // Updated to match ProcessedImage type
  views?: number;
  createdAt?: string;
  channelName?: string;
  verified?: boolean;
  duration?: string | number;
}

interface PostResult {
  id: string;
  type: 'post';
  title?: string;
  content?: string;
  description?: string;
  username?: string;
  displayName?: string;
  avatar?: ProcessedImage | string | null; // Updated to match ProcessedImage type
  verified?: boolean;
  createdAt?: string;
}

interface BlogResult {
  id: string;
  type: 'blog';
  title?: string;
  description?: string;
  createdAt?: string;
  username?: string;
  displayName?: string;
  avatar?: ProcessedImage | string | null; // Updated to match ProcessedImage type
  verified?: boolean;
}

type SearchResult =
  | UserResult
  | ChannelResult
  | VideoResult
  | ShortResult
  | PostResult
  | BlogResult;

interface TrendingItem {
  id: string;
  term: string;
  count: number;
  category?: string;
}

// Raw API types remain the same...
type RawUser = Partial<Pick<User, 'id' | 'username' | 'displayName' | 'profilePic'>> & {
  verified?: boolean;
  followerCount?: number;
  createdAt?: string;
};
type RawChannel = Partial<Pick<Channel, 'id' | 'name' | 'avatar' | 'verified'>> & {
  handle?: string;
  followerCount?: number;
  videoCount?: number;
  createdAt?: string;
};
type RawVideo = Partial<
  Pick<mVideo, 'id' | 'title' | 'description' | 'thumbnailUrl' | 'duration' | 'createdAt'>
> & {
  videoId?: string;
  thumbnail?: ProcessedImage | string;
  views?: number;
  viewCount?: number;
  channelName?: string;
  channel?: { name?: string; verified?: boolean };
  publishedAt?: string;
};
type RawShort = Partial<
  Pick<Short, 'id' | 'title' | 'thumbnailUrl' | 'duration' | 'views' | 'createdAt' | 'caption'>
> & {
  viewCount?: number;
  thumbnail?: ProcessedImage | string;
  description?: string;
  channelName?: string;
  channel?: { name?: string; verified?: boolean };
  publishedAt?: string;
};
type RawPost = Partial<
  Pick<Post, 'id' | 'createdAt'> & {
    title?: string;
    content?: string;
    desc?: string;
    user?: { username?: string; displayName?: string; profilePic?: ProcessedImage | string; verified?: boolean };
    author?: { username?: string; displayName?: string; profilePic?: ProcessedImage | string; verified?: boolean };
  }
>;
type RawBlog = Partial<
  Pick<Blog, 'id' | 'title' | 'excerpt' | 'subtitle' | 'publishedAt'> & {
    authorUsername?: string;
    authorDisplayName?: string;
    authorProfilePic?: ProcessedImage | string;
    authorVerified?: boolean;
  }
>;

// Helper to detect a thumbnail container { data, type, status }
function isThumbnailContainer(val: unknown): val is { data: ProcessedImage } {
  return typeof val === 'object' && val !== null && 'data' in val;
}

const SEARCH_TYPES = [
  { key: 'top', label: 'Top', icon: FiTrendingUp },
  { key: 'latest', label: 'Latest', icon: FiSearch },
  { key: 'videos', label: 'Videos', icon: FiVideo },
  { key: 'shorts', label: 'Shorts', icon: FiPlay },
  { key: 'channels', label: 'Channels', icon: FiUsers },
  { key: 'people', label: 'People', icon: FiUsers },
  { key: 'blogs', label: 'Blogs', icon: FiHash },
  { key: 'all', label: 'All', icon: FiGrid },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'top';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ---- Updated format helpers to properly handle ProcessedImage ----
  const formatUsers = (users: RawUser[]): UserResult[] =>
    users
      .filter(u => !!u && typeof u.id === 'string')
      .map(u => ({
        id: u.id as string,
        type: 'user',
        username: u.username,
        displayName: u.displayName ?? u.username,
        avatar: u.profilePic, // Now properly typed as ProcessedImage | string | null
        verified: u.verified,
        followerCount: u.followerCount,
        createdAt: u.createdAt,
      }));

  const formatChannels = (channels: RawChannel[]): ChannelResult[] =>
    channels
      .filter(c => !!c && typeof c.id === 'string')
      .map(c => ({
        id: c.id as string,
        type: 'channel',
        handle: c.handle,
        title: c.name,
        displayName: c.name,
        avatar: c.avatar, // Now properly typed as ProcessedImage | string | null
        verified: c.verified,
        followerCount: c.followerCount,
        videoCount: c.videoCount,
        createdAt: c.createdAt,
      }));

  const formatVideos = (videos: RawVideo[]): VideoResult[] =>
    videos
      .filter(v => !!(v.id || v.videoId))
      .map(v => ({
        id: (v.id || v.videoId) as string,
        type: 'video',
        title: v.title,
        description: v.description,
        // If backend sends a container, unwrap to .data; else use provided ProcessedImage|string
        thumbnail: isThumbnailContainer(v.thumbnailUrl) ? v.thumbnailUrl.data : (v.thumbnail ?? v.thumbnailUrl),
        views: v.views ?? v.viewCount,
        duration: v.duration,
        createdAt: v.createdAt || v.publishedAt,
        channelName: v.channel?.name || v.channelName,
        verified: v.channel?.verified,
      }));

  const formatShorts = (shorts: RawShort[]): ShortResult[] =>
    shorts
      .filter(s => !!s.id)
      .map(s => ({
        id: s.id as string,
        type: 'short',
        title: s.title,
        description: s.caption || s.description,
        // Unwrap Short.thumbnailUrl container to ProcessedImage
        thumbnail: isThumbnailContainer(s.thumbnailUrl) ? s.thumbnailUrl.data : s.thumbnail,
        views: s.views ?? s.viewCount,
        createdAt: s.createdAt || s.publishedAt,
        channelName: s.channel?.name || s.channelName,
        verified: s.channel?.verified,
        duration: s.duration,
      }));

  const formatPosts = (posts: RawPost[]): PostResult[] =>
    posts
      .filter(p => !!p.id)
      .map(p => {
        const author = p.user || p.author || {};
        const content = p.content || p.desc;
        return {
          id: p.id as string,
          type: 'post',
          title: p.title || (content ? content.substring(0, 50) + '...' : undefined),
          description: content,
          content,
          createdAt: p.createdAt,
          username: author.username,
          displayName: author.displayName,
          avatar: author.profilePic, // Now properly typed
          verified: author.verified,
        };
      });

  const formatBlogs = (blogs: RawBlog[]): BlogResult[] =>
    blogs
      .filter(b => !!b.id)
      .map(b => ({
        id: b.id as string,
        type: 'blog',
        title: b.title ?? undefined,
        description: (b.excerpt ?? b.subtitle) ?? undefined,
        createdAt: b.publishedAt ?? undefined,
        username: b.authorUsername ?? undefined,
        displayName: b.authorDisplayName ?? undefined,
        avatar: b.authorProfilePic ?? undefined, // Now properly typed
        verified: b.authorVerified ?? undefined,
      }));

  const formatSearchResults = useCallback((raw: unknown[], resultType: string): SearchResult[] => {
    switch (resultType) {
      case 'users':
      case 'people':
        return formatUsers(raw as RawUser[]);
      case 'channels':
        return formatChannels(raw as RawChannel[]);
      case 'videos':
        return formatVideos(raw as RawVideo[]);
      case 'shorts':
        return formatShorts(raw as RawShort[]);
      case 'posts':
        return formatPosts(raw as RawPost[]);
      case 'blogs':
        return formatBlogs(raw as RawBlog[]);
      default:
        return formatPosts(raw as RawPost[]);
    }
  }, []);

  // Debounced search
  const debouncedSearchRef = useRef<((q: string, t: string) => void) | undefined>(undefined);

  useEffect(() => {
    debouncedSearchRef.current = debounce(
      async (searchQuery: string, searchType: string) => {
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
            { credentials: 'include', headers: { Accept: 'application/json' } }
          );
          if (!response.ok) throw new Error('Search failed');

          const data: {
            type?: string;
            results?:
              | unknown[]
              | {
                  users?: RawUser[];
                  channels?: RawChannel[];
                  videos?: RawVideo[];
                  shorts?: RawShort[];
                  posts?: RawPost[];
                  blogs?: RawBlog[];
                };
          } = await response.json();

          let aggregated: SearchResult[] = [];

          if (data.results) {
            if (!Array.isArray(data.results) && data.type === 'all') {
              const bucket = data.results;
              aggregated = [
                ...formatUsers(bucket.users || []),
                ...formatChannels(bucket.channels || []),
                ...formatVideos(bucket.videos || []),
                ...formatShorts(bucket.shorts || []),
                ...formatPosts(bucket.posts || []),
                ...formatBlogs(bucket.blogs || []),
              ];
            } else if (Array.isArray(data.results)) {
              aggregated = formatSearchResults(data.results, data.type || searchType);
            }
          }
          setResults(aggregated);
          setHasSearched(true);
        } catch (err) {
          console.error('Search error:', err);
          setError('Failed to search. Please try again.');
          setResults([]);
        } finally {
          setLoading(false);
        }
      },
      300
    );
  }, [formatSearchResults]);

  // Trigger search
  useEffect(() => {
    if (query && debouncedSearchRef.current) {
      debouncedSearchRef.current(query, type);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [query, type]);

  // Trending
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/trending`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          const trendingData = data.results || data.trending || data;
          setTrending(Array.isArray(trendingData) ? (trendingData as TrendingItem[]) : []);
        }
      } catch (err) {
        console.error('Failed to load trending:', err);
      }
    };
    loadTrending();
  }, []);

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('type', newType);
    if (query) params.set('q', query);
    router.push(`/search?${params.toString()}`);
  };

  const handleTrendingClick = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}&type=top`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        <main className="flex-1 min-w-0">
          {/* Updated root: Responsive padding */}
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiSearch className="w-5 h-5 text-gray-500" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {query ? `Search results for "${query}"` : 'Search'}
                </h1>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SEARCH_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => handleTypeChange(t.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        type === t.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {!query && !loading && (
              <div className="space-y-6">
                <TrendingSection trending={trending} onTrendingClick={handleTrendingClick} />
              </div>
            )}

            {query && hasSearched && !loading && (
              <div className="space-y-4">
                {results.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Found {results.length} results
                    </p>
                    <SearchResults results={results} />
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

// Result Item
function SearchResultItem({ result }: { result: SearchResult }) {
  const getResultLink = () => {
    switch (result.type) {
      case 'video':
        return `/watch/${result.id}`;
      case 'short':
        return `/shorts/${result.id}`;
      case 'channel':
        return `/channel/${result.handle || result.id}`;
      case 'user':
        return `/profile/${result.username || result.id}`;
      case 'post':
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

  const post = isPost(result);
  const linkProps = post
    ? { href: getResultLink(), target: '_blank', rel: 'noopener noreferrer' }
    : { href: getResultLink() };

  const Wrapper: React.ElementType = post ? 'a' : Link;

  const label = primaryLabel(result);
  const createdAt = result.createdAt || '';
  const views = resultViews(result) || 0;
  const resultDesc =
    (isVideo(result) || isShort(result) || isBlog(result) || isPost(result))
      ? (result.description || (isPost(result) ? result.content : undefined))
      : undefined;

  return (
    <Wrapper {...linkProps}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {(isVideo(result) || isShort(result)) ? (
              <div className="relative w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                {result.thumbnail ? (
                  <AuthenticatedImage
                    mediaKey={getImageSrc(result.thumbnail, '480w')}
                    alt={label}
                    fill
                    className="object-cover"
                    sizes="160px"
                    fallbackSrc="/placeholder-video.jpg"
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
                {resultAvatar(result) ? (
                  <AuthenticatedImage
                    mediaKey={getImageSrc(resultAvatar(result), '480w')}
                    alt={label}
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {label}
                </h3>

                {(isVideo(result) || isShort(result)) ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.channelName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatCount(views)} views</span>
                      <span>•</span>
                      <span>{timeAgo(createdAt)}</span>
                    </div>
                  </div>
                ) : isPost(result) ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by @{result.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(createdAt)}
                    </p>
                  </div>
                ) : isBlog(result) ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by {result.displayName || result.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(createdAt)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {resultUsername(result) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{resultUsername(result)}
                      </p>
                    )}
                    {'followerCount' in result && typeof (result as { followerCount?: number }).followerCount === 'number' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCount((result as { followerCount: number }).followerCount)}{' '}
                        {isChannel(result) ? 'subscribers' : 'followers'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full capitalize">
                  {result.type}
                </div>
                {'verified' in result && result.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {resultDesc && !isPost(result) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {resultDesc}
              </p>
            )}

            {isPost(result) && result.content && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-2">
                {result.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

// Trending Section
function TrendingSection({
  trending,
  onTrendingClick,
}: {
  trending: TrendingItem[];
  onTrendingClick: (term: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trending Searches
        </h2>
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
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.term}
                </p>
                {item.category && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.category}
                  </p>
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

// Results list
function SearchResults({ results }: { results: SearchResult[] }) {
  return (
    <div className="space-y-4">
      {results.map(r => (
        <SearchResultItem key={`${r.type}-${r.id}`} result={r} />
      ))}
    </div>
  );
}

// No results
function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-12">
      <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No results found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We couldn&apos;t find anything for &quot;{query}&quot;. Try a different
        search term.
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

// Helper type guards & accessors (replace prior (result as any) usage)
function isVideo(r: SearchResult): r is VideoResult { return r.type === 'video'; }
function isShort(r: SearchResult): r is ShortResult { return r.type === 'short'; }
function isPost(r: SearchResult): r is PostResult { return r.type === 'post'; }
function isBlog(r: SearchResult): r is BlogResult { return r.type === 'blog'; }
function isChannel(r: SearchResult): r is ChannelResult { return r.type === 'channel'; }
function isUser(r: SearchResult): r is UserResult { return r.type === 'user'; }

function primaryLabel(r: SearchResult): string {
  if (isVideo(r) || isShort(r) || isBlog(r)) return r.title || '';
  if (isPost(r)) return r.title || r.content?.slice(0, 50) || '';
  if (isChannel(r)) return r.title || r.displayName || '';
  if (isUser(r)) return r.displayName || r.username || '';
  return '';
}

function resultUsername(r: SearchResult): string | undefined {
  if (isUser(r) || isPost(r) || isBlog(r)) return r.username;
  return undefined;
}

function resultAvatar(r: SearchResult): ProcessedImage | string | null | undefined {
  if (isVideo(r) || isShort(r)) return undefined;
  return (r as UserResult | ChannelResult | PostResult | BlogResult).avatar;
}

function resultViews(r: SearchResult): number | undefined {
  if (isVideo(r) || isShort(r)) return r.views;
  return undefined;
}

// Debounce (preserve argument types)
function debounce<Args extends unknown[]>(
  func: (...args: Args) => unknown,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      void func(...args);
    }, wait);
  };
}