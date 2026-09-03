import type { Metadata } from "next";
import { Amiri, Cairo } from "next/font/google";
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
  title: "محل زينب · تأجير فساتين الزفاف والسهرات",
  description: "نظام مالي ومخزوني لمحل زينب لتأجير فساتين الزفاف والسهرات.",
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
      <body className="min-h-full bg-[#f3f1ee] font-sans text-stone-700">{children}</body>
    </html>
  );
}
