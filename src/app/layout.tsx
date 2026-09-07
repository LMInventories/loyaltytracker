import type { Metadata } from "next";
import { Zilla_Slab, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/shared/Providers";

const displaySerif = Zilla_Slab({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
  title: "HPLoyalty",
  description: "Loyalty rewards for local businesses",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displaySerif.variable} ${bodySans.variable} ${numberMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
