"use client";
import { FC, useRef, useState, useEffect, useCallback, useMemo, type RefObject } from "react";
import Link from "next/link";
import AuthenticatedImage from "@/components/Image";
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
  FiFileText,
} from "react-icons/fi";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface SearchSuggestion {
  id: string;
  text: string;
  displayText: string;
  type: "trending" | "user" | "channel" | "search" | "blog";
  category?: string;
  data?: unknown;
  isTrending?: boolean;
  score?: number;
}

const Header: FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const api_link = process.env.NEXT_PUBLIC_API_URL;

  // cast div refs to the hook-expected RefObject<HTMLElement> (safe — HTMLDivElement extends HTMLElement)
  useOutsideClick(profileMenuRef as unknown as RefObject<HTMLElement>, () => setShowProfileMenu(false));
  useOutsideClick(searchRef as unknown as RefObject<HTMLElement>, () => setShowSuggestions(false));

  const [tagline, setTagline] = useState<string>("Loading...");

  useEffect(() => {
    // include api_link in deps so linter knows about it
    if (!api_link) {
      setTagline("Craft your digital legacy.");
      return;
    }
    fetch(`${api_link}/api/content/taglines`)
      .then((res) => res.json())
      .then((data) => setTagline(data?.tagline || "Craft your digital legacy."))
      .catch(() => setTagline("Craft your digital legacy."));
  }, [api_link]);

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Debounced search suggestions (memoized so dependencies are explicit)
  const debouncedGetSuggestions = useMemo(() => {
    return debounce(async (query: string) => {
      setLoadingSuggestions(true);

      try {
        const response = await fetch(
          `${api_link}/search/suggestions?q=${encodeURIComponent(query)}`,
          {
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const formattedSuggestions: SearchSuggestion[] = (Array.isArray(data?.suggestions) ? data.suggestions : []).map((s: unknown, index: number) => {
            const suggestion = s as Record<string, unknown>;
            return {
              id: `${String(suggestion.type ?? "item")}-${index}`,
              text: String(suggestion.text ?? ""),
              displayText: String(suggestion.displayText ?? suggestion.text ?? ""),
              type: (suggestion.type as SearchSuggestion["type"]) ?? "search",
              category: typeof suggestion.category === "string" ? suggestion.category : undefined,
              data: suggestion.data,
              isTrending: Boolean(suggestion.isTrending),
              score: typeof suggestion.score === "number" ? suggestion.score : undefined,
            } as SearchSuggestion;
          });

          setSuggestions(formattedSuggestions);
        }
      } catch (err) {
        console.error("Failed to get suggestions:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  }, [api_link]);

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
      loadTrendingSuggestions();
      setShowSuggestions(true);
    }
  };

  const loadTrendingSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `${api_link}/search/trending`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const trendingSuggestions: SearchSuggestion[] = (Array.isArray(data?.trending) ? data.trending : [])
          .slice(0, 6)
          .map((t: unknown, index: number) => {
            const trend = t as Record<string, unknown>;
            const text = String(trend.text ?? "");
            const category = typeof trend.category === "string" ? trend.category : undefined;
            return {
              id: `trending-${index}`,
              text,
              displayText: `${text}${category ? ` · Trending in ${category}` : ""}`,
              type: "trending",
              category,
              isTrending: true,
              score: typeof trend.score === "number" ? trend.score : undefined,
            } as SearchSuggestion;
          });
        setSuggestions(trendingSuggestions);
      }
    } catch (err) {
      console.error("Failed to get trending:", err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);

    switch (suggestion.type) {
      case "user":
        router.push(`/profile/${(suggestion.data as Record<string, unknown>)?.username || suggestion.text.replace("@", "")}`);
        break;
      case "channel":
        router.push(`/channel/${(suggestion.data as Record<string, unknown>)?.handle || suggestion.text.replace("@", "")}`);
        break;
      case "blog":
        router.push(`/blog/${(suggestion.data as Record<string, unknown>)?.slug || (suggestion.data as Record<string, unknown>)?.id}`);
        break;
      case "trending":
      case "search":
      default:
        router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
        break;
    }

    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "user":
        return <FiUser className="w-4 h-4 text-blue-500" />;
      case "channel":
        return <FiUsers className="w-4 h-4 text-purple-500" />;
      case "blog":
        return <FiFileText className="w-4 h-4 text-green-500" />;
      case "trending":
        return <FiTrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <FiSearch className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case "user":
        return "User";
      case "channel":
        return "Channel";
      case "blog":
        return "Blog";
      case "trending":
        return "Trending";
      default:
        return "";
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // remove unused event param
  const handleHeaderClick = useCallback(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isSidebarOpen]);

  // Safely coerce user to a record so we don't use `any`
  const userRec = (user as Record<string, unknown> | null) ?? null;
  const profilePicKey = typeof userRec?.profilePic === 'string' ? String(userRec.profilePic) : '';
  const usernameText = userRec ? String(userRec.username ?? userRec.name ?? 'Username') : 'Username';
  const emailText = userRec ? String(userRec.email ?? 'user@example.com') : 'user@example.com';

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <header
        ref={searchRef}
        onClick={handleHeaderClick}
        className="w-full fixed top-0 z-[60] bg-white dark:bg-gray-900/80 backdrop-blur-md shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 justify-between">
          {/* Hamburger icon and Logo */}
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleSidebar}
              className="text-gray-900 dark:text-gray-100 focus:outline-none z-50 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <Link
              href="/"
              className="font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient"
              title={tagline}
            >
              MOSAIC
            </Link>
            {/* show tagline on md+ screens to avoid layout shift */}
            <span className="hidden md:inline-block text-sm text-gray-600 dark:text-gray-300 ml-2">
              {tagline}
            </span>
          </div>

          {/* Center: Enhanced Search Bar with Autocomplete */}
          <div className="flex-1 mx-4 flex justify-center max-w-md">
            <div className="relative w-full">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search videos, shorts, channels, blogs, and users..."
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
              {showSuggestions &&
                (suggestions.length > 0 || loadingSuggestions) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {loadingSuggestions ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-gray-500">
                          Loading suggestions...
                        </span>
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
                                  {suggestion.type === "search" &&
                                  searchQuery.trim() ? (
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
                              {suggestion.category &&
                                suggestion.type === "trending" && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    in {suggestion.category}
                                  </span>
                                )}
                            </div>
                            {suggestion.type !== "search" && (
                              <span className="text-xs text-gray-400 uppercase tracking-wide">
                                {getSuggestionTypeLabel(suggestion.type)}
                              </span>
                            )}
                          </button>
                        ))}

                        {/* Quick search type filters */}
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
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="focus:outline-none"
              >
                <AuthenticatedImage
                  mediaKey={profilePicKey}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full h-7 w-7"
                  fallbackSrc="/placeholder.png"
                />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
                  <div className="mb-2">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {usernameText}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {emailText}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <ul>
                      <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <Link href="/create" className="flex items-center w-full">
                          <FiPlus className="mr-2" /> <span>Create</span>
                        </Link>
                      </li>
                      <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <Link href="/settings" className="flex items-center w-full">
                          <FiSettings className="mr-2" /> <span>Settings</span>
                        </Link>
                      </li>
                      <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <Link href="/profile" className="flex items-center w-full">
                          <FiUser className="mr-2" /> <span>Profile</span>
                        </Link>
                      </li>
                      <li
                        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                        onClick={handleLogout}
                      >
                        <FiLogOut className="mr-2" /> <span>Logout</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Header;

// Debounce utility function
function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
