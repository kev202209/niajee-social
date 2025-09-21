import { FC, useRef, RefObject } from "react";
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
  Bookmark,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import useOutsideClick from "@/hooks/useOutsideClick";

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  pushContent?: boolean;
  interaction?: "hover" | "click"; // default "hover"
  overlayOnExpand?: boolean;       // default false
  // NEW: control width when in click mode (defaults to w-60)
  clickWidthClass?: string;
}

const Sidebar: FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
  pushContent = true,
  interaction = "hover",
  overlayOnExpand = false,
  clickWidthClass, // NEW
}) => {
  const pathname = usePathname() || "/";
  const asideRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(
    [asideRef as RefObject<HTMLElement | null>, toggleBtnRef as RefObject<HTMLElement | null>],
    () => {
      if (interaction === "click" && isExpanded) setIsExpanded(false);
    }
  );

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

  const widthClass = isExpanded ? "w-40" : "w-20";

  const hoverHandlers =
    interaction === "hover"
      ? {
          onMouseEnter: () => setIsExpanded(true),
          onMouseLeave: () => setIsExpanded(false),
        }
      : {};

  const basePositionClasses =
    interaction === "click"
      ? "fixed left-0 top-16 z-50"
      : `fixed left-0 top-16 ${pushContent ? "" : "z-50"}`;

  const transformClasses =
    interaction === "click"
      ? `${isExpanded ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200`
      : "";

  return (
    <>
      {/* Toggle button (click mode only) */}
      {interaction === "click" && !isExpanded && (
        <button
          ref={toggleBtnRef}
          aria-label="Open sidebar"
          onClick={() => setIsExpanded(true)}
          className="fixed left-2 top-20 z-[60] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Backdrop (only when expanded in click mode and overlayOnExpand) */}
      {interaction === "click" && overlayOnExpand && isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          aria-hidden="true"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside
        ref={asideRef}
        className={`
          ${interaction === "hover" ? "hidden lg:flex" : "flex"}
          flex-col
          ${basePositionClasses}
          bg-white dark:bg-gray-900
          transition-all duration-300 ease-in-out
          ${interaction === "click" ? (clickWidthClass || "w-60") : widthClass}
          h-[calc(100vh-4rem)]
          items-start justify-start overflow-hidden
          ${transformClasses}
        `}
        {...hoverHandlers}
      >
        {/* Close button (click mode only) */}
        {interaction === "click" && isExpanded && (
          <div className="w-full flex justify-end p-2">
            <button
              aria-label="Close sidebar"
              onClick={() => setIsExpanded(false)}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        <nav
          className="w-full p-3 pt-1 flex flex-col items-start justify-start overflow-y-auto scrollbar-hide"
          aria-label="Main navigation"
        >
          <ul className="flex flex-col items-start w-full space-y-2">
            {menuItems.map(({ icon: Icon, label, href, external }) => {
              const isActive =
                !external && (href === "/" ? pathname === href : pathname.startsWith(href));
              const baseClasses =
                "flex items-center justify-start rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer p-3 w-full";
              const activeClasses = isActive
                ? "bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-200 dark:ring-blue-800 text-blue-600"
                : "";

              return (
                <li key={label} className="w-full">
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${baseClasses} ${activeClasses}`}
                      title={label}
                      aria-label={label}
                      onClick={() => interaction === "click" && setIsExpanded(false)}
                    >
                      <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
                      <span className={`ml-3 ${isExpanded ? "inline-block" : "hidden"}`}>{label}</span>
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className={`${baseClasses} ${activeClasses}`}
                      title={label}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => interaction === "click" && setIsExpanded(false)}
                    >
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
    </>
  );
};

export default Sidebar;
