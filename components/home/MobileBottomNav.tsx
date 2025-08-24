import React, { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Component, UsersRound, PlusCircle } from "lucide-react";

const MobileBottomNav: FC = () => {
  const pathname = usePathname() || "/";

  const items = [
    { icon: Home, label: "Home", href: "/" },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    // center create button will be separate
    { icon: Component, label: "Shorts", href: "/shorts" },
    { icon: UsersRound, label: "Community", href: `${process.env.NEXT_PUBLIC_FRONTEND_B_URL}`, external: true },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      // hide the whole mobile nav on large screens
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom lg:hidden"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center justify-between h-14">
          {/* Left / right items */}
          <div className="flex-1 flex items-center justify-between lg:hidden">
            {items.slice(0, 2).map(({ icon: Icon, label, href, external }) => {
              const isActive = !external && pathname.startsWith(href);
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex-1 flex flex-col items-center justify-center py-2 ${isActive ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}
                  aria-label={label}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] mt-1">{label}</span>
                </Link>
              );
            })}

            {/* spacer for central create button */}
            <div className="w-16" />

            {items.slice(2).map(({ icon: Icon, label, href, external }) => {
              const isActive = !external && pathname.startsWith(href);
              if (external) {
                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex flex-col items-center justify-center py-2 ${isActive ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}
                    aria-label={label}
                    title={label}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-[10px] mt-1">{label}</span>
                  </a>
                );
              }
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex-1 flex flex-col items-center justify-center py-2 ${isActive ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}
                  aria-label={label}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] mt-1">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Center create button (prominent) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-6">
            <Link
              href="/create"
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg ring-4 ring-white/70 dark:ring-black/60"
              aria-label="Create"
              title="Create"
            >
              <PlusCircle className="w-7 h-7" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;