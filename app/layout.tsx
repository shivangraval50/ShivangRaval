import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
import MotionProvider from "@/components/MotionProvider";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Shivang Raval | Quant Trader & AI Engineer",
  description:
    "MS CS @ Northeastern | Building high-performance trading systems and production ML infrastructure. 20 projects spanning quant trading, distributed ML, NLP, and systems programming.",
};

export const viewport: Viewport = {
  themeColor: "#05070a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${mono.variable} font-sans bg-void text-ink-primary antialiased selection:bg-signal-cyan/30 selection:text-white`}>
        <MotionProvider>{children}</MotionProvider>
        <GoogleAnalytics gaId="G-XY979VBLM5" />
      </body>
    </html>
  );
}
