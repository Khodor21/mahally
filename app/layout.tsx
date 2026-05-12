import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'


export const metadata: Metadata = {
  title: 'StoreForge — Build Your Store in Minutes',
  description: 'Create your online store with a single form. Get your link instantly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink text-paper font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
