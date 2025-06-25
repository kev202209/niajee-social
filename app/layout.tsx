// app/layout.tsx
import './globals.css'
import Header from '@/components/Header'
import { Providers } from '@/components/Providers'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mosaic - Social Media Super App',
  description: 'An all-in-one social media experience with feeds, videos, and more.',
  keywords: ['social media', 'super app', 'feeds', 'videos', 'community', 'Mosaic'], // Added keywords for SEO
  icons: { // Added favicon configuration
    icon: '/favicon.jpg', // Path to your favicon file in the public directory
    // apple: '/apple-touch-icon.png', // Example for apple touch icon
    // other sizes and formats can be defined here
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 scrollbar scrollbar-dark">
        <AuthProvider>
          <Providers>
            <main className="">{children}</main>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
