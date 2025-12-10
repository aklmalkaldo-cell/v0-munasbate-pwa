import type React from "react"
import type { Metadata, Viewport } from "next"
import { Tajawal } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Munasbate | منصة المناسبات الأولى",
  description:
    "منصة متكاملة لخدمات المناسبات - زفات احترافية، شيلات مميزة، دعوات إلكترونية، تهنئات مبتكرة. اجعل مناسبتك لا تُنسى!",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["مناسبات", "زفات", "شيلات", "دعوات", "تهنئات", "أعراس", "حفلات", "السعودية", "زواج", "تخرج"],
  authors: [{ name: "Munasbate Team" }],
  creator: "Munasbate",
  publisher: "Munasbate Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://munasbate.com",
    siteName: "Munasbate - منصبتي",
    title: "Munasbate | منصة المناسبات الأولى",
    description: "منصة متكاملة لخدمات المناسبات - زفات، شيلات، دعوات، تهنئات",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Munasbate - منصة المناسبات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Munasbate | منصة المناسبات الأولى",
    description: "منصة متكاملة لخدمات المناسبات - زفات، شيلات، دعوات، تهنئات",
    images: ["/og-image.png"],
    creator: "@munasbate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#D4AF37" }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D4AF37" },
    { media: "(prefers-color-scheme: dark)", color: "#B38C8A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Munasbate" />
      </head>
      <body className={`${tajawal.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
