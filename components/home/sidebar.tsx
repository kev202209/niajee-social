import { FC } from "react";
import {
  Home,
  TrendingUp,
  LaptopMinimalCheck,
  Library,
  History,
  Download,
  Component,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Newspaper,
  UsersRound
} from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}


const Sidebar: FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: PlusCircle, label: "Create", href: "/create" },
    { icon: Newspaper, label: "Blogs", href: "/blogs" },
    { icon: UsersRound, label: "Community", href: `${process.env.NEXT_PUBLIC_SECOND_FRONTEND_URL}` },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: Component, label: "Shorts", href: "/shorts" },
    { icon: LaptopMinimalCheck, label: "Subscriptions", href: "/subscriptions" },
    { icon: Library, label: "Library", href: "/library" },
    { icon: History, label: "History", href: "/history" },
    { icon: Download, label: "Downloads", href: "/downloads" },
  ];

  return (
    <aside
      className={`
        h-[calc(100vh-4rem)] flex-shrink-0
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${isExpanded ? "w-40" : "w-20"}
        overflow-hidden flex flex-col
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-3 flex-1 overflow-y-auto scrollbar-hide">
        <ul className="space-y-2">
          {menuItems.map(({ icon: Icon, label, href }) => (
            <li key={label}>
              <a
                href={href}
                className={`
                  flex items-center rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-all duration-200
                  group cursor-pointer relative
                  ${isExpanded ? "p-3" : "p-3 justify-center"}
                `}
                title={!isExpanded ? label : ""}
              >
                <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                <span
                  className={`
                    text-gray-900 dark:text-gray-100 font-medium text-sm
                    transition-all duration-300 whitespace-nowrap
                    ${isExpanded 
                      ? "opacity-100 translate-x-0 ml-3 w-auto" 
                      : "opacity-0 translate-x-2 ml-0 w-0 overflow-hidden"
                    }
                  `}
                >
                  {label}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {label}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div 
          className={`
            text-xs text-gray-500 dark:text-gray-400 text-center
            transition-all duration-300
            ${isExpanded ? "opacity-100" : "opacity-0"}
          `}
        >
          © {new Date().getFullYear()} MOSAIC
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
