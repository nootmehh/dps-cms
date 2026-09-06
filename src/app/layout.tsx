import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DPS CMS",
  description: "DPS Content Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} font-sans antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-brand-background text-dark flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
