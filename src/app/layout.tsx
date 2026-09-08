import type { Metadata, Viewport } from "next";
import { Amiri, Cairo } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
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
  themeColor: "#2d0503",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-[#2d0503]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
