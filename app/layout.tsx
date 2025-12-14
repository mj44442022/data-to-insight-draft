import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContentOS - AI Instagram Automation',
  description: 'Transform photos into Instagram carousels and reels in 2 minutes. 30X faster than manual creation.',
  keywords: ['Instagram', 'AI', 'Content Creation', 'Social Media', 'Automation', 'Carousel', 'Reel'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
