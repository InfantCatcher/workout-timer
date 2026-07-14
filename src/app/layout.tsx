import type { Metadata } from 'next';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'PulseTime | Advanced Workout Timekeeper & Voice Timer',
  description:
    'Customizable workout timer app with micro to macro set & rest timing per exercise, synthesized audio alerts, TTS voice announcements, and Vercel cloud synchronization.',
  keywords: [
    'workout timer',
    'interval timekeeper',
    'HIIT timer',
    'Tabata timer',
    'voice exercise announcements',
    'rest interval counter',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
