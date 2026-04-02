import type { Metadata } from 'next'
import { Instrument_Serif, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SleepSync — Go to sleep on time',
  description: 'A behavior-change app that helps you build a consistent sleep schedule with streaks, wind-down rituals, and accountability.',
  manifest: '/manifest.json',
  themeColor: '#0A0A0F',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SleepSync',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-background text-text-primary antialiased font-space min-h-screen">
        {children}
      </body>
    </html>
  )
}
