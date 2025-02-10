// components/DarkModeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure the component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded focus:outline-none focus:ring focus:ring-blue-500"
      aria-label="Toggle Dark Mode"
    >

      {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} color="#3e9392" />}
    </button>
  )
}
