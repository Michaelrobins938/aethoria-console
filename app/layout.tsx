import type { Metadata } from 'next'
import './globals.css'

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
      <body>
        {children}
      </body>
    </html>
  )
} 