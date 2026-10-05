import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
});

const DESCRIPTION =
  'Notas de um nômade digital brasileiro: trabalho remoto, infraestrutura e a vida na estrada.';

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.ignaulin.com'),
  title: {
    default: 'ignaulin.blog — Notas de um nômade digital',
    template: '%s | ignaulin',
  },
  description: DESCRIPTION,
  authors: [{ name: 'Rafael Ignaulin' }],
  creator: 'Rafael Ignaulin',
  openGraph: {
    siteName: 'ignaulin.blog',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://blog.ignaulin.com',
    title: 'ignaulin.blog — Notas de um nômade digital',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
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
  description: DESCRIPTION,
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
        {/* Cloudflare Web Analytics (cookieless) — one site token covers every ignaulin.com host */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: 'ef7b3d31dfb54000aef843ecd79172ba' })}
        />
      </body>
    </html>
  );
}
