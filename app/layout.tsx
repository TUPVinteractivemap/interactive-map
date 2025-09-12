import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import InactivityProvider from "@/components/InactivityProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { HistoryProvider } from "@/contexts/HistoryContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TUPV Interactive Map",
  description: "Navigate the Technological University of the Philippines Visayas campus with ease using our interactive 2D map application. Find buildings, rooms, and plan your route!",
  metadataBase: new URL("https://tupv-interactive-map.vercel.app/"),
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
        url: "/og-image-tup.png",
        width: 1200,
        height: 630,
        alt: "TUPV Interactive Map - Navigate TUPV Campus"
      }
    ],
    locale: "en_PH",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "TUPV Interactive Map",
    description: "Navigate the TUPV campus with ease using our interactive 2D map application.",
    images: ["/og-image-tup.png"]
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <HistoryProvider>
            <InactivityProvider>
              {children}
            </InactivityProvider>
          </HistoryProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
