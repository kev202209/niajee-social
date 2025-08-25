import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  History,
  Component,
  PlusCircle,
  Newspaper,
  UsersRound,
  Bookmark
} from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const pathname = usePathname() || "/";

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: PlusCircle, label: "Create", href: "/create" },
    { icon: Newspaper, label: "Blogs", href: "/blogs" },
    { icon: UsersRound, label: "Community", href: `${process.env.NEXT_PUBLIC_FRONTEND_B_URL}`, external: true },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: Component, label: "Shorts", href: "/shorts" },
    { icon: History, label: "History", href: "/history" },
    { icon: Bookmark, label: "Saved", href: "/saved" },
  ];

  return (
    // Desktop-only sidebar; mobile uses MobileBottomNav component
    <aside
      className={`
        hidden lg:flex flex-col
        bg-white dark:bg-gray-900
        transition-all duration-300 ease-in-out
        ${isExpanded ? "w-40" : "w-20"}
        h-[calc(100vh-4rem)]
        items-start justify-start overflow-hidden
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="w-full p-3 flex flex-col items-start justify-start overflow-y-auto scrollbar-hide" aria-label="Main navigation">
        <ul className="flex flex-col items-start w-full space-y-2">
          {menuItems.map(({ icon: Icon, label, href, external }) => {
            const isActive = !external && (href === "/" ? pathname === href : pathname.startsWith(href));
            const baseClasses = `flex items-center justify-start rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer p-3 w-full`;
            const activeClasses = isActive ? "bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-200 dark:ring-blue-800 text-blue-600" : "";

            return (
              <li key={label} className="w-full">
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={`${baseClasses} ${activeClasses}`} title={label} aria-label={label}>
                    <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                    <span className={`ml-3 ${isExpanded ? "inline-block" : "hidden"}`}>{label}</span>
                  </a>
                ) : (
                  <Link href={href} className={`${baseClasses} ${activeClasses}`} title={label} aria-current={isActive ? "page" : undefined}>
                    <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                    <span className={`ml-3 ${isExpanded ? "inline-block" : "hidden"}`}>{label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
