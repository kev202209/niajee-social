"use client";
import { FC, useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DarkModeToggle from "../DarkModeToggle";
import useOutsideClick from "@/hooks/useOutsideClick";
import {
  FiSearch,
  FiUser,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiTrendingUp,
  FiVideo,
  FiPlay,
  FiUsers,
  FiFileText, // Add this for blogs
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedImage from "@/components/Image";
import { useRouter } from 'next/navigation';

interface SearchSuggestion {
  id: string;
  text: string;
  displayText: string;
  type: 'trending' | 'user' | 'channel' | 'search' | 'blog';
  category?: string;
  // safer typed container for arbitrary backend payload
  data?: Record<string, unknown> | null;
  isTrending?: boolean;
  score?: number;
}

const Header: FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useOutsideClick(profileMenuRef, () => setShowProfileMenu(false));
  useOutsideClick(searchRef, () => setShowSuggestions(false));

  // small tagline placed under logo to avoid unused-var lint
  const [tagline, setTagline] = useState<string>("Craft your digital legacy.");

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;
    void fetch(`${api}/api/content/taglines`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.tagline === 'string') setTagline(data.tagline);
      })
      .catch(() => setTagline("Craft your digital legacy."));
  }, []); // env is stable, safe to leave deps empty

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Fixed debounced search suggestions: useMemo to create debounced fn and safely narrow backend data
  const debouncedGetSuggestions = useMemo(() => {
    return debounce(async (query: string) => {
      setLoadingSuggestions(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search/suggestions?q=${encodeURIComponent(query)}`,
          {
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const raw = Array.isArray(data.suggestions) ? data.suggestions as unknown[] : [];
          const formattedSuggestions: SearchSuggestion[] = raw.map((s, index) => {
            const rec = (s as Record<string, unknown>) ?? {};
            const type = typeof rec.type === 'string' ? (rec.type as SearchSuggestion['type']) : 'search';
            const text = typeof rec.text === 'string' ? rec.text : String(rec.id ?? `s-${index}`);
            const displayText = typeof rec.displayText === 'string' ? rec.displayText : text;
            const category = typeof rec.category === 'string' ? rec.category : undefined;
            const isTrending = Boolean(rec.isTrending);
            const score = typeof rec.score === 'number' ? rec.score : undefined;
            const dataField = rec.data ? (rec.data as Record<string, unknown>) : undefined;

            return {
              id: `${type}-${index}`,
              text,
              displayText,
              type,
              category,
              data: dataField,
              isTrending,
              score
            };
          });

          setSuggestions(formattedSuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    // empty deps - uses only stable refs / env / setters
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      debouncedGetSuggestions(value);
      setShowSuggestions(true);
    } else {
      // Load trending suggestions for empty query
      void loadTrendingSuggestions();
      setShowSuggestions(true);
    }
  };

  const loadTrendingSuggestions = async () => {
    setLoadingSuggestions(true);
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
        const raw = Array.isArray(data.trending) ? data.trending as unknown[] : [];
        const trendingSuggestions: SearchSuggestion[] = raw.slice(0, 6).map((t, index) => {
          const rec = (t as Record<string, unknown>) ?? {};
          const text = typeof rec.text === 'string' ? rec.text : `trend-${index}`;
          const category = typeof rec.category === 'string' ? rec.category : undefined;
          const score = typeof rec.score === 'number' ? rec.score : undefined;
          return {
            id: `trending-${index}`,
            text,
            displayText: `${text} · Trending in ${category ?? 'General'}`,
            type: 'trending',
            category,
            data: rec.data as Record<string, unknown> | undefined,
            isTrending: true,
            score
          };
        });
        setSuggestions(trendingSuggestions);
      }
    } catch (err) {
      console.error('Failed to get trending:', err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);

    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'user':
        router.push(`/profile/${suggestion.data?.username || suggestion.text.replace('@', '')}`);
        break;
      case 'channel':
        router.push(`/channel/${suggestion.data?.handle || suggestion.text.replace('@', '')}`);
        break;
      case 'blog': // Add this case
        router.push(`/blog/${suggestion.data?.slug || suggestion.data?.id}`);
        break;
      case 'trending':
      case 'search':
      default:
        router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
        break;
    }

    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <FiUser className="w-4 h-4 text-blue-500" />;
      case 'channel':
        return <FiUsers className="w-4 h-4 text-purple-500" />;
      case 'blog': // Add this case
        return <FiFileText className="w-4 h-4 text-green-500" />;
      case 'trending':
        return <FiTrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <FiSearch className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'user': return 'User';
      case 'channel': return 'Channel';
      case 'blog': return 'Blog';
      case 'trending': return 'Trending';
      default: return '';
    }
  };

  return (
    <header className="w-full fixed top-0 z-50 bg-white dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          <Link
            href="/"
            className="font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient text-xl sm:text-2xl md:text-3xl"
          >
            NIAJEE
          </Link>
          <span className="ml-3 text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block">{tagline}</span>
        </div>

        {/* Center: Enhanced Search Bar with Autocomplete */}
        <div className="flex-1 mx-4 flex justify-center max-w-md">
          <div className="relative w-full" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search videos, shorts, channels, blogs, and users..." // Updated placeholder
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (!searchQuery.trim()) {
                    loadTrendingSuggestions();
                  }
                  setShowSuggestions(true);
                }}
                className="w-full px-4 py-2 pl-10 pr-10 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {loadingSuggestions && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </form>

            {/* Enhanced Search Suggestions with Categories */}
            {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {loadingSuggestions ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading suggestions...</span>
                  </div>
                ) : (
                  <div className="py-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 group"
                      >
                        {getSuggestionIcon(suggestion.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {/* Highlight matching text if it's a search query */}
                              {suggestion.type === 'search' && searchQuery.trim() ? (
                                <span className="font-medium">
                                  {suggestion.displayText}
                                </span>
                              ) : (
                                suggestion.displayText
                              )}
                            </span>
                            {suggestion.isTrending && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Trending
                              </span>
                            )}
                          </div>
                          {suggestion.category && suggestion.type === 'trending' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              in {suggestion.category}
                            </span>
                          )}
                        </div>
                        {suggestion.type !== 'search' && (
                          <span className="text-xs text-gray-400 uppercase tracking-wide">
                            {getSuggestionTypeLabel(suggestion.type)}
                          </span>
                        )}
                      </button>
                    ))}
                    
                    {/* Add quick search type filters */}
                    {searchQuery.trim() && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                          <div className="px-4 py-1">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Search in
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=videos`);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          >
                            <FiVideo className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Videos for &quot;{searchQuery}&quot;
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=shorts`);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          >
                            <FiPlay className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Shorts for &quot;{searchQuery}&quot;
                            </span>
                          </button>
                          {/* Add this button for blogs */}
                          <button
                            onClick={() => {
                              router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=blogs`);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          >
                            <FiFileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Blogs for &quot;{searchQuery}&quot;
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=channels`);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                          >
                            <FiUsers className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Channels for &quot;{searchQuery}&quot;
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Dark Mode Toggle & Profile Menu */}
        <div className="flex items-center space-x-3">
          <DarkModeToggle />
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="focus:outline-none ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 rounded-full transition-all duration-200"
            >
              <AuthenticatedImage
                mediaKey={user?.profilePic || ""}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full"
                fallbackSrc="/placeholder.png"
              />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {user ? user.username : "Username"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user ? user.email : "you@email.com"}
                  </p>
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link href="/create" className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <FiPlus className="mr-3 w-4 h-4" />
                      <span className="text-sm">Create</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <FiUser className="mr-3 w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <FiSettings className="mr-3 w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <FiLogOut className="mr-3 w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

// Debounce utility function
function debounce<Args extends unknown[], R>(
  func: (...args: Args) => R | Promise<R>,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // call and intentionally ignore returned Promise
      void func(...args);
    }, wait);
  };
}