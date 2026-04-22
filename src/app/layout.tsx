import type { Metadata } from "next";
import localFont from "next/font/local";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "par.loa — URL Shortener",
  description: "Shorten your URLs with par.loa",
  openGraph: {
    title: "par.loa — URL Shortener",
    description: "Shorten your URLs with par.loa",
    url: "https://parloa-interview.vercel.app",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "par.loa — URL Shortener",
    description: "Shorten your URLs with par.loa",
  },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
