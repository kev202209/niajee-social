// components/Header.tsx
import Link from 'next/link'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          Fusion
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="/shorts" className="text-gray-900 hover:text-blue-500 dark:text-white">
            Shorts
          </Link>
          <Link href="/long-videos" className="text-gray-900 hover:text-blue-500 dark:text-white">
            Long Videos
          </Link>
          <Link href="/microblogs" className="text-gray-900 hover:text-blue-500 dark:text-white">
            Microblogs
          </Link>
          <Link href="/profile" className="text-gray-900 hover:text-blue-500 dark:text-white">
            Profile
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <DarkModeToggle />
        <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-300">
          Login
        </Link>
        <Link href="/auth/register" className="text-sm text-gray-600 dark:text-gray-300">
          Sign up
        </Link>
      </div>
    </header>
  )
}
