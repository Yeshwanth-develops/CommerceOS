import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommerceOS - Merchant Growth Copilot",
  description: "E-Commerce operating system for merchants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-mono font-bold">
                  C
                </span>
                CommerceOS
              </Link>
              <nav className="flex items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/products" className="hover:text-black dark:hover:text-white transition">
                  Products
                </Link>
                <Link href="/orders" className="hover:text-black dark:hover:text-white transition">
                  Orders
                </Link>
                <Link href="/growth" className="hover:text-black dark:hover:text-white transition flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <span>✨</span> Growth AI
                </Link>
                <Link href="/audit" className="hover:text-black dark:hover:text-white transition">
                  Audit Trail
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              API Online
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
