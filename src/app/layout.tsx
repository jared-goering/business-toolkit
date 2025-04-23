import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from 'next/font/google';
import "./globals.css";
import { DialogLinkFixer } from "./components/DialogLinkFixer";
import { ReportProvider } from "@/context/ReportContext";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // optional, to reduce layout shift
});

export const metadata: Metadata = {
  title: "Venture Forge",
  description: "A smarter way to build businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DialogLinkFixer />
        <ReportProvider>
          {children}
        </ReportProvider>
      </body>
    </html>
  );
}
