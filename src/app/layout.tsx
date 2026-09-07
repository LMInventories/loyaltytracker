import type { Metadata, Viewport } from "next";
import { Baloo_2, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/shared/Providers";
import { RegisterServiceWorker } from "@/components/shared/RegisterServiceWorker";

const displayRounded = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodySans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const numberMono = IBM_Plex_Mono({
  variable: "--font-number",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Local Loyalty",
  description: "Loyalty rewards for local businesses",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "Local Loyalty",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2f55",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayRounded.variable} ${bodySans.variable} ${numberMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
