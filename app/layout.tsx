import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
import MotionProvider from "@/components/MotionProvider";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Shivang Raval | AI/ML Engineer",
  description:
    "MS CS @ Northeastern | AI/ML Engineer building production ML infrastructure and LLM systems, with deep quantitative trading systems experience. 20 projects spanning distributed training, LLM inference, NLP, quant trading, and systems programming.",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans bg-void text-ink-primary antialiased selection:bg-brand-primary/30 selection:text-ink-primary`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <p className="sr-only">
          Portfolio of Shivang Raval, an AI/ML Engineer with a quantitative-trading specialization. Twenty real,
          interactive engineering projects — including a working language interpreter, a price-time-priority
          order-matching engine, and a retrieval-augmented chatbot — that you can run directly in the browser, not
          just read about. Sections on this page: about, experience, skills, projects, education and
          certifications, and contact.
        </p>
        <MotionProvider>{children}</MotionProvider>
        <GoogleAnalytics gaId="G-XY979VBLM5" />
      </body>
    </html>
  );
}
