import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const title = 'Cliproom - Social Media Downloader';
const description =
  'Paste link konten public, cek preview-nya, lalu download media yang tersedia. Gunakan hanya untuk konten yang kamu miliki atau punya izin untuk digunakan.';

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: '/icon.svg' },
  openGraph: { title, description, type: 'website', locale: 'id_ID' },
};

export const viewport: Viewport = {
  themeColor: '#F4F1EA',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
