'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { generateBulkSalePDF } from '@/lib/pdfN'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export default function BulkSalesPage() {
  const [activeTab, setActiveTab] = useState<'sale' | 'customers' | 'products'>('sale')
  const [sales, setSales] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Sale form
  const [saleForm, setSaleForm] = useState({
    customer_id: '',
    product_id: '',
    quantity: '',
    price_per_kg: '',
    total_amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paid_amount: '',
    remaining_amount: '',
  })
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null)

  // Customer form
  const [customerForm, setCustomerForm] = useState({
    shop_name: '',
    owner_name: '',
    contact_number: '',
  })
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
  })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchSales(), fetchCustomers(), fetchProducts()])
  }

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_sales')
        .select(`
          *,
          customers (*),
          products (*)
        `)
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const quantity = parseFloat(saleForm.quantity) || 0
    const pricePerKg = parseFloat(saleForm.price_per_kg) || 0
    const totalAmount = quantity * pricePerKg
    const paidAmount = parseFloat(saleForm.paid_amount) || 0
    const remainingAmount = totalAmount - paidAmount

    setLoading(true)
    try {
      const saleData = {
        customer_id: saleForm.customer_id,
        product_id: saleForm.product_id,
        quantity,
        price_per_kg: pricePerKg,
        total_amount: totalAmount,
        date: saleForm.date,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
      }

      if (editingSaleId) {
        const { error } = await supabase
          .from('bulk_sales')
          .update(saleData)
          .eq('id', editingSaleId)

        if (error) throw error
        alert('વેચાણ સફળતાપૂર્વક અપડેટ થયું!')
        setEditingSaleId(null)
      } else {
        const { error } = await supabase
          .from('bulk_sales')
          .insert(saleData)

        if (error) throw error
        alert('વેચાણ સફળતાપૂર્વક ઉમેરાયું!')
      }

      resetSaleForm()
      fetchSales()
    } catch (error) {
      console.error('Error saving sale:', error)
      alert('ભૂલ: વેચાણ સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const resetSaleForm = () => {
    setSaleForm({
      customer_id: '',
      product_id: '',
      quantity: '',
      price_per_kg: '',
      total_amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paid_amount: '',
      remaining_amount: '',
    })
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingCustomerId) {
        const { error } = await supabase
          .from('customers')
          .update(customerForm)
          .eq('id', editingCustomerId)

        if (error) throw error
        alert('ગ્રાહક સફળતાપૂર્વક અપડેટ થયો!')
        setEditingCustomerId(null)
      } else {
        const maxOrder = customers.length > 0 ? Math.max(...customers.map(c => c.display_order || 0)) : 0
        const { error } = await supabase
          .from('customers')
          .insert({
            ...customerForm,
            display_order: maxOrder + 1,
          })

        if (error) throw error
        alert('ગ્રાહક સફળતાપૂર્વક ઉમેરાયો!')
      }

      setCustomerForm({ shop_name: '', owner_name: '', contact_number: '' })
      fetchCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('ભૂલ: ગ્રાહક સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingProductId) {
        const { error } = await supabase
          .from('products')
          .update(productForm)
          .eq('id', editingProductId)

        if (error) throw error
        alert('પ્રોડક્ટ સફળતાપૂર્વક અપડેટ થયું!')
        setEditingProductId(null)
      } else {
        const maxOrder = products.length > 0 ? Math.max(...products.map(p => p.display_order || 0)) : 0
        const { error } = await supabase
          .from('products')
          .insert({
            ...productForm,
            display_order: maxOrder + 1,
          })

        if (error) throw error
        alert('પ્રોડક્ટ સફળતાપૂર્વક ઉમેરાયું!')
      }

      setProductForm({ name: '' })
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('ભૂલ: પ્રોડક્ટ સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerDragEnd = async (result: any) => {
    if (!result.destination) return

    const newCustomers = Array.from(customers)
    const [reorderedCustomer] = newCustomers.splice(result.source.index, 1)
    newCustomers.splice(result.destination.index, 0, reorderedCustomer)

    setCustomers(newCustomers)

    for (let i = 0; i < newCustomers.length; i++) {
      await supabase
        .from('customers')
        .update({ display_order: i + 1 })
        .eq('id', newCustomers[i].id)
    }
  }

  const handleProductDragEnd = async (result: any) => {
    if (!result.destination) return

    const newProducts = Array.from(products)
    const [reorderedProduct] = newProducts.splice(result.source.index, 1)
    newProducts.splice(result.destination.index, 0, reorderedProduct)

    setProducts(newProducts)

    for (let i = 0; i < newProducts.length; i++) {
      await supabase
        .from('products')
        .update({ display_order: i + 1 })
        .eq('id', newProducts[i].id)
    }
  }

  const handlePaymentUpdate = async (saleId: string, paidAmount: number) => {
    try {
      const sale = sales.find(s => s.id === saleId)
      if (!sale) return

      const remaining = parseFloat(sale.total_amount) - paidAmount
      const { error } = await supabase
        .from('bulk_sales')
        .update({
          paid_amount: paidAmount,
          remaining_amount: remaining,
        })
        .eq('id', saleId)

      if (error) throw error
      fetchSales()
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('ભૂલ: પેમેન્ટ અપડેટ કરવામાં સમસ્યા')
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('sale')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
              activeTab === 'sale'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            વેચાણ
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
              activeTab === 'customers'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            ગ્રાહકો
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
              activeTab === 'products'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            પ્રોડક્ટ્સ
          </button>
        </div>
      </div>

      {/* Sale Tab */}
      {activeTab === 'sale' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingSaleId ? 'વેચાણ સંપાદિત કરો' : 'નવું વેચાણ ઉમેરો'}
            </h2>

            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ગ્રાહક</label>
                <select
                  value={saleForm.customer_id}
                  onChange={(e) => setSaleForm({ ...saleForm, customer_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">ગ્રાહક પસંદ કરો</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.shop_name} - {customer.owner_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">પ્રોડક્ટ</label>
                <select
                  value={saleForm.product_id}
                  onChange={(e) => setSaleForm({ ...saleForm, product_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">પ્રોડક્ટ પસંદ કરો</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">પ્રમાણ (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={saleForm.quantity}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0
                      const price = parseFloat(saleForm.price_per_kg) || 0
                      setSaleForm({
                        ...saleForm,
                        quantity: e.target.value,
                        total_amount: (qty * price).toFixed(2),
                      })
                    }}
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">કિંમત/કિલો (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={saleForm.price_per_kg}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0
                      const qty = parseFloat(saleForm.quantity) || 0
                      setSaleForm({
                        ...saleForm,
                        price_per_kg: e.target.value,
                        total_amount: (qty * price).toFixed(2),
                      })
                    }}
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">કુલ રકમ (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={saleForm.total_amount}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">તારીખ</label>
                <input
                  type="date"
                  value={saleForm.date}
                  onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">ચૂકવેલ રકમ (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={saleForm.paid_amount}
                  onChange={(e) => {
                    const paid = parseFloat(e.target.value) || 0
                    const total = parseFloat(saleForm.total_amount) || 0
                    setSaleForm({
                      ...saleForm,
                      paid_amount: e.target.value,
                      remaining_amount: (total - paid).toFixed(2),
                    })
                  }}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">બાકી રકમ (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={saleForm.remaining_amount}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : editingSaleId ? 'અપડેટ કરો' : 'ઉમેરો'}
              </button>
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
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {sale.customers?.shop_name || 'N/A'} - {sale.products?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {sale.quantity} KG × ₹{parseFloat(sale.price_per_kg).toFixed(2)}/KG
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        કુલ: ₹{parseFloat(sale.total_amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">{sale.date}</p>
                      <div className="mt-2 flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          parseFloat(sale.remaining_amount) > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          ચૂકવેલ: ₹{parseFloat(sale.paid_amount).toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          parseFloat(sale.remaining_amount) > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          બાકી: ₹{parseFloat(sale.remaining_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setEditingSaleId(sale.id)
                          setSaleForm({
                            customer_id: sale.customer_id,
                            product_id: sale.product_id,
                            quantity: sale.quantity.toString(),
                            price_per_kg: sale.price_per_kg.toString(),
                            total_amount: sale.total_amount.toString(),
                            date: sale.date,
                            paid_amount: sale.paid_amount.toString(),
                            remaining_amount: sale.remaining_amount.toString(),
                          })
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          const newPaid = prompt('નવી ચૂકવેલ રકમ દાખલ કરો:', sale.paid_amount)
                          if (newPaid !== null) {
                            handlePaymentUpdate(sale.id, parseFloat(newPaid))
                          }
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                      >
                        💰
                      </button>
                      <button
                        onClick={() => generateBulkSalePDF(sale, sale.customers, sale.products)}
                        className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                      >
                        📄
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingCustomerId ? 'ગ્રાહક સંપાદિત કરો' : 'નવો ગ્રાહક ઉમેરો'}
            </h2>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">દુકાનનું નામ</label>
                <input
                  type="text"
                  value={customerForm.shop_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, shop_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">માલિકનું નામ</label>
                <input
                  type="text"
                  value={customerForm.owner_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, owner_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">સંપર્ક નંબર (વૈકલ્પિક)</label>
                <input
                  type="tel"
                  value={customerForm.contact_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, contact_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : editingCustomerId ? 'અપડેટ કરો' : 'ઉમેરો'}
              </button>

              {editingCustomerId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustomerId(null)
                    setCustomerForm({ shop_name: '', owner_name: '', contact_number: '' })
                  }}
                  className="w-full bg-gray-500 text-white font-bold py-4 rounded-xl text-lg"
                >
                  રદ કરો
                </button>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ગ્રાહકોની યાદી</h3>
            <DragDropContext onDragEnd={handleCustomerDragEnd}>
              <Droppable droppableId="customers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {customers.map((customer, index) => (
                      <Draggable key={customer.id} draggableId={customer.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{customer.shop_name}</p>
                              <p className="text-sm text-gray-600">{customer.owner_name}</p>
                              {customer.contact_number && (
                                <p className="text-sm text-gray-600">{customer.contact_number}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <div {...provided.dragHandleProps} className="cursor-move text-2xl">
                                ☰
                              </div>
                              <button
                                onClick={() => {
                                  setEditingCustomerId(customer.id)
                                  setCustomerForm({
                                    shop_name: customer.shop_name,
                                    owner_name: customer.owner_name,
                                    contact_number: customer.contact_number || '',
                                  })
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingProductId ? 'પ્રોડક્ટ સંપાદિત કરો' : 'નવું પ્રોડક્ટ ઉમેરો'}
            </h2>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">પ્રોડક્ટનું નામ</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : editingProductId ? 'અપડેટ કરો' : 'ઉમેરો'}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null)
                    setProductForm({ name: '' })
                  }}
                  className="w-full bg-gray-500 text-white font-bold py-4 rounded-xl text-lg"
                >
                  રદ કરો
                </button>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">પ્રોડક્ટ્સની યાદી</h3>
            <DragDropContext onDragEnd={handleProductDragEnd}>
              <Droppable droppableId="products">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {products.map((product, index) => (
                      <Draggable key={product.id} draggableId={product.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-gray-800">{product.name}</p>
                            </div>
                            <div className="flex space-x-2">
                              <div {...provided.dragHandleProps} className="cursor-move text-2xl">
                                ☰
                              </div>
                              <button
                                onClick={() => {
                                  setEditingProductId(product.id)
                                  setProductForm({ name: product.name })
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      )}
    </div>
  )
}

