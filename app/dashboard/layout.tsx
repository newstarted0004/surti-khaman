'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated, logout } from '@/lib/auth'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    logout()
  }

  const menuItems = [
    { href: '/dashboard', label: 'ડેશબોર્ડ', icon: '📊' },
    { href: '/dashboard/sales', label: 'વેચાણ', icon: '💰' },
    { href: '/dashboard/purchases', label: 'ખરીદી', icon: '🛒' },
    { href: '/dashboard/bulk-sales', label: 'બલ્ક વેચાણ', icon: '📦' },
    { href: '/dashboard/workers', label: 'કામદાર', icon: '👥' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">સુરતી ખમણ</h1>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              લૉગઆઉટ
            </button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-primary-200 z-50">
        <div className="container mx-auto px-2">
          <div className="flex justify-around items-center py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${
                  pathname === item.href
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-primary-50'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}

