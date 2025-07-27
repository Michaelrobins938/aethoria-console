import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aethoria AI Gaming Console',
  description: 'AI-powered interactive storytelling and gaming platform',
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
      <body className={inter.className}>{children}</body>
    </html>
  )
} 