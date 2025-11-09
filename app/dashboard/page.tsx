'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayPurchases: 0,
    todayBulkSales: 0,
    todayWorkerCosts: 0,
    monthlySales: 0,
    monthlyPurchases: 0,
    monthlyBulkSales: 0,
    monthlyWorkerCosts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'today' | 'month' | 'year'>('today')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')
      const yearStart = format(startOfYear(new Date()), 'yyyy-MM-dd')
      const yearEnd = format(endOfYear(new Date()), 'yyyy-MM-dd')

      let dateStart = today
      let dateEnd = today

      if (period === 'month') {
        dateStart = monthStart
        dateEnd = monthEnd
      } else if (period === 'year') {
        dateStart = yearStart
        dateEnd = yearEnd
      }

      // Fetch daily sales
      const { data: sales } = await supabase
        .from('daily_sales')
        .select('total_amount')
        .gte('date', dateStart)
        .lte('date', dateEnd)

      // Fetch purchases
      const { data: purchases } = await supabase
        .from('material_purchases')
        .select('total_bill')
        .gte('date', dateStart)
        .lte('date', dateEnd)

      // Fetch bulk sales
      const { data: bulkSales } = await supabase
        .from('bulk_sales')
        .select('total_amount')
        .gte('date', dateStart)
        .lte('date', dateEnd)

      // Fetch worker costs (salary payments)
      const { data: salaryPayments } = await supabase
        .from('worker_salary_payments')
        .select('amount')
        .gte('date', dateStart)
        .lte('date', dateEnd)

      const totalSales = sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0
      const totalPurchases = purchases?.reduce((sum, p) => sum + Number(p.total_bill), 0) || 0
      const totalBulkSales = bulkSales?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0
      const totalWorkerCosts = salaryPayments?.reduce((sum, w) => sum + Number(w.amount), 0) || 0

      if (period === 'today') {
        setStats({
          todaySales: totalSales,
          todayPurchases: totalPurchases,
          todayBulkSales: totalBulkSales,
          todayWorkerCosts: totalWorkerCosts,
          monthlySales: 0,
          monthlyPurchases: 0,
          monthlyBulkSales: 0,
          monthlyWorkerCosts: 0,
        })
      } else {
        setStats({
          todaySales: 0,
          todayPurchases: 0,
          todayBulkSales: 0,
          todayWorkerCosts: 0,
          monthlySales: totalSales,
          monthlyPurchases: totalPurchases,
          monthlyBulkSales: totalBulkSales,
          monthlyWorkerCosts: totalWorkerCosts,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNetProfit = () => {
    const sales = period === 'today' ? stats.todaySales : stats.monthlySales
    const purchases = period === 'today' ? stats.todayPurchases : stats.monthlyPurchases
    const bulkSales = period === 'today' ? stats.todayBulkSales : stats.monthlyBulkSales
    const workerCosts = period === 'today' ? stats.todayWorkerCosts : stats.monthlyWorkerCosts

    return sales + bulkSales - purchases - workerCosts
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">લોડ થઈ રહ્યું છે...</p>
        </div>
      </div>
    )
  }

  const sales = period === 'today' ? stats.todaySales : stats.monthlySales
  const purchases = period === 'today' ? stats.todayPurchases : stats.monthlyPurchases
  const bulkSales = period === 'today' ? stats.todayBulkSales : stats.monthlyBulkSales
  const workerCosts = period === 'today' ? stats.todayWorkerCosts : stats.monthlyWorkerCosts
  const netProfit = getNetProfit()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">એનાલિટિક્સ</h2>
        
        {/* Period Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setPeriod('today')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              period === 'today'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            આજે
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              period === 'month'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            મહિનો
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              period === 'year'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            વર્ષ
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white shadow-md">
            <p className="text-sm opacity-90 mb-1">કુલ વેચાણ</p>
            <p className="text-2xl font-bold">₹{sales.toFixed(2)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white shadow-md">
            <p className="text-sm opacity-90 mb-1">બલ્ક વેચાણ</p>
            <p className="text-2xl font-bold">₹{bulkSales.toFixed(2)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-4 text-white shadow-md">
            <p className="text-sm opacity-90 mb-1">ખરીદી</p>
            <p className="text-2xl font-bold">₹{purchases.toFixed(2)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 text-white shadow-md">
            <p className="text-sm opacity-90 mb-1">કામદાર ખર્ચ</p>
            <p className="text-2xl font-bold">₹{workerCosts.toFixed(2)}</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`mt-6 rounded-xl p-6 shadow-md ${
          netProfit >= 0
            ? 'bg-gradient-to-br from-secondary-400 to-secondary-600 text-white'
            : 'bg-gradient-to-br from-red-500 to-red-700 text-white'
        }`}>
          <p className="text-lg font-semibold mb-2">નફો / નુકસાન</p>
          <p className="text-4xl font-bold">₹{netProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">ઝડપી ક્રિયાઓ</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/dashboard/sales"
            className="bg-primary-500 text-white p-4 rounded-xl text-center font-semibold shadow-md hover:shadow-lg transition-all"
          >
            💰 વેચાણ ઉમેરો
          </Link>
          <Link
            href="/dashboard/purchases"
            className="bg-blue-500 text-white p-4 rounded-xl text-center font-semibold shadow-md hover:shadow-lg transition-all"
          >
            🛒 ખરીદી ઉમેરો
          </Link>
          <Link
            href="/dashboard/bulk-sales"
            className="bg-green-500 text-white p-4 rounded-xl text-center font-semibold shadow-md hover:shadow-lg transition-all"
          >
            📦 બલ્ક વેચાણ
          </Link>
          <Link
            href="/dashboard/workers"
            className="bg-purple-500 text-white p-4 rounded-xl text-center font-semibold shadow-md hover:shadow-lg transition-all"
          >
            👥 કામદાર
          </Link>
        </div>
      </div>
    </div>
  )
}

