import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import Providers from './providers';
import '../index.css';
const dmSans = localFont({
  src: '../assets/fonts/DMSans-Variable.ttf',
  variable: '--font-dm-sans',
  weight: '100 1000',
  display: 'swap',
});
const dmSerif = localFont({
  src: '../assets/fonts/DMSerifDisplay-Regular.ttf',
  variable: '--font-dm-serif',
  weight: '400',
  display: 'swap',
});
export const metadata: Metadata = { title: 'BrewLite', description: 'Đặt đồ uống BrewLite', icons: { icon: '/brewlite.svg' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi" className={`${dmSans.variable} ${dmSerif.variable}`}><body><Suspense fallback={<p role="status" className="p-12 text-center">Đang tải BrewLite...</p>}><Providers>{children}</Providers></Suspense></body></html>;
}
