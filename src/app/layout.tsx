import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Warm body sans (Plus Jakarta) + characterful display (Bricolage Grotesque).
// Geist Mono is kept for tabular figures in dense data (tables, axes) only.
const bodySans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hermes Dashboard",
  description: "Private self-hosted dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodySans.variable} ${displayFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
