import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AnimeStream Bot",
  description: "Telegram Mini App for watching anime",
  viewport: "width=device-width, initial-scale=1, user-scalable=no",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
