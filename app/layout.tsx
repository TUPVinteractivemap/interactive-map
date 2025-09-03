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
  description: "Navigate TUPV campus with ease using our interactive 2D map application.",
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
