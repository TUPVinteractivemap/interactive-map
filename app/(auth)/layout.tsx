import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "TUPV Interactive Map",
  description: "Navigate the Technological University of the Philippines Visayas campus with ease using our interactive 2D map application. Find buildings, rooms, and plan your route!",
  keywords: [
    "TUPV",
    "Technological University of the Philippines Visayas",
    "interactive map",
    "campus map",
    "building search",
    "room search",
    "navigation",
    "Philippines university map"
  ],
  authors: [{ name: "TUPV Interactive Map Team", url: "https://tupv.edu.ph" }],
  creator: "TUPV Interactive Map Team",
  openGraph: {
    title: "TUPV Interactive Map",
    description: "Navigate the TUPV campus with ease using our interactive 2D map application.",
    url: "https://tupvmap.edu.ph",
    siteName: "TUPV Interactive Map",
    images: [
      {
        url: "/images/tupv-logo.png",
        width: 1200,
        height: 630,
        alt: "TUPV Interactive Map Logo"
      }
    ],
    locale: "en_PH",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "TUPV Interactive Map",
    description: "Navigate the TUPV campus with ease using our interactive 2D map application.",
    images: ["/images/tupv-logo.png"]
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
