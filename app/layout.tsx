import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

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
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <nav className="bg-primary text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">API Manager</Link>
            <ul className="flex space-x-4">
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}