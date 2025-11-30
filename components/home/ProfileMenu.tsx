"use client";
import Link from "next/link";
import { FiPlus, FiUser, FiLogOut, FiStar } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileMenuProps {
  show: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ show, onClose, anchorRef }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!show) return null;

  return (
    <div
      ref={anchorRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50"
    >
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
          <Link
            href={`${process.env.NEXT_PUBLIC_FRONTEND_B_URL}/${user?.username ?? ""}`}
            className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiUser className="mr-3 w-4 h-4" />
            <span className="text-sm">Profile</span>
          </Link>
        </li>
        <li>
          <Link
            href="/home/subscriptions"
            className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={onClose}
          >
            <FiStar className="mr-3 w-4 h-4" />
            <span className="text-sm">My Memberships</span>
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
  );
};

export default ProfileMenu;