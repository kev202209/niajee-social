// app/layout.tsx
import './globals.css'
import { Providers } from '@/components/Providers'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import {PostHogProvider} from './providers/PHprovider'
import CookieConsent from '@/components/CookieConsent'

// Base site URL used for absolute OG/Twitter URLs
const siteUrl = process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Niajee',
  title: 'Niajee - Social Media Super App',
  description: 'An all-in-one social media experience with feeds, videos, and more.',
  keywords: ['social media', 'super app', 'feeds', 'videos', 'community', 'Niajee'],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Niajee',
    title: 'Niajee - Social Media Super App',
    description: 'An all-in-one social media experience with feeds, videos, and more.',
    images: [
      {
        url: '/favicon.jpg',
        width: 1200,
        height: 630,
        alt: 'Niajee - Social Media Super App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Niajee - Social Media Super App',
    description: 'An all-in-one social media experience with feeds, videos, and more.',
    images: ['/favicon.jpg'],
  },
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <PostHogProvider>
          <AuthProvider>
            <Providers>
              <Toaster position="top-right" richColors closeButton />
              <main className="">{children}</main>
              <CookieConsent />
            </Providers>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
