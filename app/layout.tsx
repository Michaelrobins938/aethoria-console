import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aethoria AI Gaming Console',
  description: 'AI-powered interactive storytelling and gaming platform',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Force server-side rendering
async function getTimestamp() {
  return { timestamp: Date.now() }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Force server-side rendering
  await getTimestamp()
  
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#00ff41" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 