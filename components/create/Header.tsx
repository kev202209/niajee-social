'use client'

import { FC, useRef, useState, useEffect } from "react"
import Link from "next/link"
import AuthenticatedImage from "@/components/Image"
import DarkModeToggle from "../DarkModeToggle"
import useOutsideClick from "@/hooks/useOutsideClick"
import { SquareChevronLeft, SquareChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from 'next/navigation'
import ProfileMenu from "@/components/home/ProfileMenu"
import { getImageSrc } from '@/app/utils/imageUtils';

interface CreateHeaderProps {
  toggleSidebar?: () => void
  isSidebarOpen?: boolean
}

const CreateHeader: FC<CreateHeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const api_link = process.env.NEXT_PUBLIC_API_URL
  useOutsideClick([profileMenuRef], () => setShowProfileMenu(false))

  const [tagline, setTagline] = useState("Loading…")
  const { user} = useAuth()

  useEffect(() => {
    fetch(`${api_link}/api/content/taglines`)
      .then((res) => res.json())
      .then((data) => setTagline(data.tagline))
      .catch(() => setTagline("Craft your digital legacy."))
  }, [api_link])

  // Check if we're in a channel-specific route
  const isChannelRoute = pathname.match(/^\/create\/channels\/[^\/]+\//)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50">
      <div className="flex items-center h-16 px-4 justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Only show toggle if we have the toggleSidebar function */}
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              {isSidebarOpen ? (
                <SquareChevronLeft className="w-6 h-6" />
              ) : (
                <SquareChevronRight className="w-6 h-6" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="font-extrabold text-xl bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient"
            >
              NIAJEE
            </Link>
            <span className="text-xs text-white bg-blue-600 dark:bg-blue-500 rounded px-2 py-0.5 ml-1">
              Creator
            </span>
          </div>
          
          {/* Show breadcrumb for channel routes */}
          {isChannelRoute ? (
            <div className="text-sm text-gray-600 dark:text-gray-400 ml-4 hidden sm:inline">
              Channel Management
            </div>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-4 hidden sm:inline">
              {tagline}
            </span>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="focus:outline-none"
            >
              <AuthenticatedImage
                mediaKey={user!.profilePic ? getImageSrc(user!.profilePic, '480w') : ""}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full h-9 w-9"
                fallbackSrc="/placeholder.png"
              />
            </button>
            {/* Use ProfileMenu component */}
            <ProfileMenu
              show={showProfileMenu}
              onClose={() => setShowProfileMenu(false)}
              anchorRef={profileMenuRef}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default CreateHeader
