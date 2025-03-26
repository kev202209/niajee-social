import { FC } from "react";
import {
  Home,
  TrendingUp,
  LaptopMinimalCheck,
  Library,
  History,
  Download,
  Component,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen pt-16
        bg-gray-100 dark:bg-gray-900
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-56" : "w-16"}
        z-20
      `}
    >
      <ul className="space-y-2 ">
        {[
          { icon: Home, label: "Home" },
          { icon: TrendingUp, label: "Trending" },
          { icon: Component, label: "Shorts" },
          { icon: LaptopMinimalCheck, label: "Subscriptions" },
          { icon: Library, label: "Library" },
          { icon: History, label: "History" },
          { icon: Download, label: "Downloads" },
        ].map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="
              flex items-center
              transition-all duration-300 ease-in-out
              p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer
            "
          >
            <Icon
              className={`
                w-5 h-5
                text-gray-700 dark:text-gray-300
                transition-transform duration-300
                flex-shrink-0
                ${isOpen ? "translate-x-0" : "translate-x-[22px]"}
              `}
            />
            <span
              className={`
                transition-all duration-300 ease-in-out
                text-gray-900 dark:text-gray-100
                ${isOpen ? "ml-9 opacity-100" : "ml-0 opacity-0"}
              `}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
