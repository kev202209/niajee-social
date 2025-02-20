// app/layout.tsx
import './globals.css'
import Header from '@/components/Header'
import { Providers } from '@/components/Providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fusion - Social Media Super App',
  description: 'An all-in-one social media experience with feeds, videos, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Providers>
          <Header />
          <main className="">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
