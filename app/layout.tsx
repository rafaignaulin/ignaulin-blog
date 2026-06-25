import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'ignaulin.blog',
    template: '%s — ignaulin.blog',
  },
  description: 'Notas de um nômade digital brasileiro.',
  authors: [{ name: 'Rafael Ignaulin' }],
  creator: 'Rafael Ignaulin',
  openGraph: {
    siteName: 'ignaulin.blog',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://blog.ignaulin.com',
  },
  twitter: {
    card: 'summary',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://blog.ignaulin.com',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
};

const jsonLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ignaulin.blog',
  url: 'https://blog.ignaulin.com',
  description: 'Notas de um nômade digital brasileiro.',
  inLanguage: 'pt-BR',
  author: {
    '@type': 'Person',
    name: 'Rafael Ignaulin',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
        />
      </head>
      <body>
        <header className="px-8 py-6 border-b border-[#222]">
          <Link href="/" className="font-extrabold text-2xl no-underline">
            ignaulin<span className="text-accent">.</span>blog
          </Link>
        </header>
        <main className="max-w-[720px] mx-auto px-6 py-12 min-h-[60vh]">
          {children}
        </main>
        <footer className="px-6 py-6 text-center text-muted text-sm border-t border-[#222]">
          <p>&copy; {new Date().getFullYear()} Rafael Ignaulin</p>
        </footer>
      </body>
    </html>
  );
}
