import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/lib/sessionContext";
import Navbar from "@/components/Navbar";

const BASE_URL = 'https://muze.ammarimtiaz.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'muze — Play Any Instrument. Compose Anything.',
    template: '%s — muze',
  },
  description: 'Free browser-based music studio. Play 15+ real instruments with your keyboard, record clips, layer them on a multitrack timeline, and export your composition. No download, no signup.',
  keywords: ['online piano', 'play guitar online', 'browser music studio', 'online instruments', 'music composer', 'online harmonium', 'tabla online', 'free music app', 'play drums online', 'virtual keyboard instrument'],
  authors: [{ name: 'Ammar Imtiaz', url: 'https://ammarimtiaz.com' }],
  creator: 'Ammar Imtiaz',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'muze',
    title: 'muze — Play Any Instrument. Compose Anything.',
    description: 'Free browser-based music studio. Play 15+ real instruments with your keyboard, record clips, layer them on a multitrack timeline, and export your composition.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'muze — Play Any Instrument. Compose Anything.',
    description: 'Free browser-based music studio. Play 15+ real instruments with your keyboard, record clips, layer them on a multitrack timeline, and export.',
    creator: '@ammarimtiaz',
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 px-6 flex items-center justify-between text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <span>created by Ammar ❤️</span>
            <span style={{ color: 'var(--text-dim)' }}>muze.ammarimtiaz.com</span>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
