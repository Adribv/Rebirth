import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Content Rebirth - Preventing the Dead Internet',
  description: 'AI-powered content generation from meeting transcripts to create fresh, engaging content and prevent the dead internet scenario.',
  keywords: ['content generation', 'meeting transcripts', 'AI', 'dead internet', 'content creation'],
  authors: [{ name: 'Content Rebirth Team' }],
  creator: 'Content Rebirth',
  publisher: 'Content Rebirth',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Content Rebirth - Preventing the Dead Internet',
    description: 'Transform meeting transcripts into engaging content using AI',
    url: 'http://localhost:3000',
    siteName: 'Content Rebirth',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Content Rebirth - AI Content Generation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Rebirth - Preventing the Dead Internet',
    description: 'Transform meeting transcripts into engaging content using AI',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
} 