'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { generateSalesPDF } from '@/lib/pdfN'

export default function SalesPage() {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
      alert('ભૂલ: વેચાણ ડેટા લાવવામાં સમસ્યા')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      alert('કૃપા કરીને માન્ય રકમ દાખલ કરો')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from('daily_sales')
          .update({
            date,
            total_amount: parseFloat(amount),
          })
          .eq('id', editingId)

        if (error) throw error
        alert('વેચાણ સફળતાપૂર્વક અપડેટ થયું!')
        setEditingId(null)
      } else {
        const { error } = await supabase
          .from('daily_sales')
          .insert({
            date,
            total_amount: parseFloat(amount),
          })

        if (error) throw error
        alert('વેચાણ સફળતાપૂર્વક ઉમેરાયું!')
      }

      setAmount('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      fetchSales()
    } catch (error) {
      console.error('Error saving sale:', error)
      alert('ભૂલ: વેચાણ સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sale: any) => {
    setEditingId(sale.id)
    setAmount(sale.total_amount.toString())
    setDate(sale.date)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે ખરેખર આ વેચાણ કાઢી નાખવા માંગો છો?')) return

    try {
      const { error } = await supabase
        .from('daily_sales')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('વેચાણ કાઢી નાખ્યું!')
      fetchSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
      alert('ભૂલ: વેચાણ કાઢવામાં સમસ્યા')
    }
  }

  const handleDownloadPDF = async (sale: any) => {
    await generateSalesPDF(sale)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {editingId ? 'વેચાણ સંપાદિત કરો' : 'વેચાણ ઉમેરો'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              તારીખ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              કુલ વેચાણ રકમ (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'સેવ થઈ રહ્યું છે...' : editingId ? 'અપડેટ કરો' : 'ઉમેરો'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setAmount('')
                setDate(format(new Date(), 'yyyy-MM-dd'))
              }}
              className="w-full bg-gray-500 text-white font-bold py-4 rounded-xl text-lg"
            >
              રદ કરો
            </button>
          )}
        </form>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">વેચાણની યાદી</h3>
        <div className="space-y-3">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-800">
                    {format(new Date(sale.date), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{parseFloat(sale.total_amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(sale)}
                    className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    📄
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sales.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              હજુ સુધી કોઈ વેચાણ ઉમેરાયું નથી
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

