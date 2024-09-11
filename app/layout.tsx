import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Custom API Integration Manager',
  description: 'Easily create and manage custom API integrations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <nav className="bg-primary text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">API Manager</Link>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <ul className={`md:flex space-y-2 md:space-y-0 md:space-x-4 ${isMenuOpen ? 'block' : 'hidden'}`}>
              <li><Link href="/dashboard" className="block py-2 md:py-0">Dashboard</Link></li>
              <li><Link href="/pricing" className="block py-2 md:py-0">Pricing</Link></li>
            </ul>
          </div>
        </nav>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}