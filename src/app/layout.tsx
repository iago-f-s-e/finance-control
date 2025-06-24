import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { MobileNav } from '@/components/navigation/mobile-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finance Control',
  description: 'Personal finance management application',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <main className="pb-20">{children}</main>
          <MobileNav />
        </div>
      </body>
    </html>
  )
}
