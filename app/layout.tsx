import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instagram Data Analyzer",
  description: "Analyze your Instagram data export",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Simple Navigation */}
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </a>
                <a href="/upload" className="text-gray-700 hover:text-blue-600 font-medium">
                  Upload
                </a>
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </a>
              </div>
            </div>
          </nav>  
        {children}
      </body>
    </html>
  );
}