import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DPS CMS - Content Management System | PT Dua Putra Srikandi",
    template: "%s | DPS CMS",
  },
  description:
    "Portal Content Management System (CMS) resmi PT Dua Putra Srikandi untuk pengelolaan konten website, produk marka jalan, layanan konstruksi, galeri, artikel, dan optimasi SEO.",
  icons: {
    icon: [
      { url: "/dps-logo-icon-white.png?v=2", type: "image/png" },
    ],
    shortcut: "/dps-logo-icon-white.png?v=2",
    apple: "/dps-logo-icon-white.png?v=2",
  },
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
