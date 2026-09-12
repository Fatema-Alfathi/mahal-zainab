import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/app/providers";
import "./globals.css";

const thmanyah = localFont({
  src: [
    {
      path: "../fonts/thmanyahsans-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/thmanyahsans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/thmanyahsans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/thmanyahsans-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/thmanyahsans-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-thmanyah",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YAL · محل زينب · تأجير فساتين الزفاف والسهرات",
  description: "نظام مالي ومخزوني لمحل زينب لتأجير فساتين الزفاف والسهرات.",
  icons: {
    icon: "/yal-logo.jpg",
    apple: "/yal-logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#004d5b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${thmanyah.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-[var(--salla-bg)] font-sans text-[var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
