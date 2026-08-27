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
  // One value per appearance so the browser chrome matches the page in both.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0d" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans bg-void text-ink-primary antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[100] focus:rounded-full focus:bg-brand-fill focus:px-5 focus:py-2.5 focus:text-[0.9375rem] focus:font-medium focus:text-brand-onfill focus:shadow-e2"
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
