import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shivang Raval | Quant Trader & AI Engineer',
  description: 'Quant Developer | ML & MLOps | Python • C++ • LangChain • PyTorch • Kubernetes | MS CS @ Northeastern',
  keywords: ['quant trader', 'AI engineer', 'ML engineer', 'quantitative finance', 'machine learning', 'Python', 'C++'],
  authors: [{ name: 'Shivang Raval' }],
  openGraph: {
    title: 'Shivang Raval | Quant Trader & AI Engineer',
    description: 'Building high-performance trading systems and production ML infrastructure',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
        <GoogleAnalytics gaId="G-XY979VBLM5" />
      </body>
    </html>
  )
}