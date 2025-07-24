import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aethoria Console - Universal AI Gaming Platform',
  description: 'The first AI-powered universal gaming console. Insert cartridges, start playing with voice commands.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-console-dark">
          {children}
        </div>
      </body>
    </html>
  )
} 