import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Korasa | Study in Your Way",
  description:
    "Organize your studies all in one place today using Korasa.",

  authors: [{ name: "Ahmed Abdelkhaliq" }],

  openGraph: {
    title: "Korasa | Study in Your Way",
    description:
      "Organize your studies all in one place today using Korasa.",
    url: "https://korasa.study",
    siteName: "Korasa",
    images: [
      {
        url: "https://ik.imagekit.io/cin2tn3bj/korasa_logo.png?updatedAt=1787320657608",
        width: 512,
        height: 512,
        alt: "Korasa - Study in Your Way",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Korasa | Study in Your Way",
    description:
      "Organize your studies all in one place today using Korasa.",
    images: [
      "https://ik.imagekit.io/cin2tn3bj/korasa_logo.png?updatedAt=1787320657608",
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html suppressHydrationWarning lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
