import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'સુરતી ખમણ - Shop Management',
  description: 'Complete shop management system for Surti Khaman',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="gu">
      <body>{children}</body>
    </html>
  )
}

