'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { generatePurchasePDF } from '@/lib/pdf'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'shops' | 'items'>('purchase')
  const [purchases, setPurchases] = useState<any[]>([])
  const [shops, setShops] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Purchase form
  const [purchaseForm, setPurchaseForm] = useState({
    shop_id: '',
    item_id: '',
    quantity: '',
    amount: '',
    purchase_time: format(new Date(), 'HH:mm'),
    date: format(new Date(), 'yyyy-MM-dd'),
    total_bill: '',
    paid_amount: '',
    remaining_amount: '',
  })
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null)

  // Shop form
  const [shopForm, setShopForm] = useState({
    name: '',
    contact_number: '',
  })
  const [editingShopId, setEditingShopId] = useState<string | null>(null)

  // Item form
  const [itemForm, setItemForm] = useState({
    name: '',
    unit: 'KG',
  })
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchPurchases(), fetchShops(), fetchItems()])
  }

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('material_purchases')
        .select(`
          *,
          shops (*),
          items (*)
        `)
        .order('date', { ascending: false })
        .order('purchase_time', { ascending: false })
        .limit(50)

      if (error) throw error
      setPurchases(data || [])
    } catch (error) {
      console.error('Error fetching purchases:', error)
    }
  }

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setShops(data || [])
    } catch (error) {
      console.error('Error fetching shops:', error)
    }
  }

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const totalBill = parseFloat(purchaseForm.total_bill) || 0
    const paidAmount = parseFloat(purchaseForm.paid_amount) || 0
    const remainingAmount = totalBill - paidAmount

    setLoading(true)
    try {
      const purchaseData = {
        shop_id: purchaseForm.shop_id,
        item_id: purchaseForm.item_id,
        quantity: parseFloat(purchaseForm.quantity),
        amount: parseFloat(purchaseForm.amount),
        purchase_time: purchaseForm.purchase_time,
        date: purchaseForm.date,
        total_bill: totalBill,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
      }

      if (editingPurchaseId) {
        const { error } = await supabase
          .from('material_purchases')
          .update(purchaseData)
          .eq('id', editingPurchaseId)

        if (error) throw error
        alert('ખરીદી સફળતાપૂર્વક અપડેટ થઈ!')
        setEditingPurchaseId(null)
      } else {
        const { error } = await supabase
          .from('material_purchases')
          .insert(purchaseData)

        if (error) throw error
        alert('ખરીદી સફળતાપૂર્વક ઉમેરાઈ!')
      }

      resetPurchaseForm()
      fetchPurchases()
    } catch (error) {
      console.error('Error saving purchase:', error)
      alert('ભૂલ: ખરીદી સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const resetPurchaseForm = () => {
    setPurchaseForm({
      shop_id: '',
      item_id: '',
      quantity: '',
      amount: '',
      purchase_time: format(new Date(), 'HH:mm'),
      date: format(new Date(), 'yyyy-MM-dd'),
      total_bill: '',
      paid_amount: '',
      remaining_amount: '',
    })
  }

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingShopId) {
        const { error } = await supabase
          .from('shops')
          .update(shopForm)
          .eq('id', editingShopId)

        if (error) throw error
        alert('દુકાન સફળતાપૂર્વક અપડેટ થઈ!')
        setEditingShopId(null)
      } else {
        const maxOrder = shops.length > 0 ? Math.max(...shops.map(s => s.display_order || 0)) : 0
        const { error } = await supabase
          .from('shops')
          .insert({
            ...shopForm,
            display_order: maxOrder + 1,
          })

        if (error) throw error
        alert('દુકાન સફળતાપૂર્વક ઉમેરાઈ!')
      }

      setShopForm({ name: '', contact_number: '' })
      fetchShops()
    } catch (error) {
      console.error('Error saving shop:', error)
      alert('ભૂલ: દુકાન સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItemId) {
        const { error } = await supabase
          .from('items')
          .update(itemForm)
          .eq('id', editingItemId)

        if (error) throw error
        alert('વસ્તુ સફળતાપૂર્વક અપડેટ થઈ!')
        setEditingItemId(null)
      } else {
        const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order || 0)) : 0
        const { error } = await supabase
          .from('items')
          .insert({
            ...itemForm,
            display_order: maxOrder + 1,
          })

        if (error) throw error
        alert('વસ્તુ સફળતાપૂર્વક ઉમેરાઈ!')
      }

      setItemForm({ name: '', unit: 'KG' })
      fetchItems()
    } catch (error) {
      console.error('Error saving item:', error)
      alert('ભૂલ: વસ્તુ સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handleShopDragEnd = async (result: any) => {
    if (!result.destination) return

    const newShops = Array.from(shops)
    const [reorderedShop] = newShops.splice(result.source.index, 1)
    newShops.splice(result.destination.index, 0, reorderedShop)

    setShops(newShops)

    // Update display_order in database
    for (let i = 0; i < newShops.length; i++) {
      await supabase
        .from('shops')
        .update({ display_order: i + 1 })
        .eq('id', newShops[i].id)
    }
  }

  const handleItemDragEnd = async (result: any) => {
    if (!result.destination) return

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    setItems(newItems)

    // Update display_order in database
    for (let i = 0; i < newItems.length; i++) {
      await supabase
        .from('items')
        .update({ display_order: i + 1 })
        .eq('id', newItems[i].id)
    }
  }

  const handlePaymentUpdate = async (purchaseId: string, paidAmount: number) => {
    try {
      const purchase = purchases.find(p => p.id === purchaseId)
      if (!purchase) return

      const remaining = parseFloat(purchase.total_bill) - paidAmount
      const { error } = await supabase
        .from('material_purchases')
        .update({
          paid_amount: paidAmount,
          remaining_amount: remaining,
        })
        .eq('id', purchaseId)

      if (error) throw error
      fetchPurchases()
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
            onClick={() => setActiveTab('purchase')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
              activeTab === 'purchase'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            ખરીદી
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
              activeTab === 'shops'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            દુકાનો
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
              activeTab === 'items'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            વસ્તુઓ
          </button>
        </div>
      </div>

      {/* Purchase Tab */}
      {activeTab === 'purchase' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingPurchaseId ? 'ખરીદી સંપાદિત કરો' : 'નવી ખરીદી ઉમેરો'}
            </h2>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">દુકાન</label>
                <select
                  value={purchaseForm.shop_id}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, shop_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">દુકાન પસંદ કરો</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">વસ્તુ</label>
                <select
                  value={purchaseForm.item_id}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, item_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">વસ્તુ પસંદ કરો</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">પ્રમાણ</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchaseForm.quantity}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">રકમ (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchaseForm.amount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">તારીખ</label>
                  <input
                    type="date"
                    value={purchaseForm.date}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">સમય</label>
                  <input
                    type="time"
                    value={purchaseForm.purchase_time}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">કુલ બિલ (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseForm.total_bill}
                  onChange={(e) => {
                    const total = parseFloat(e.target.value) || 0
                    const paid = parseFloat(purchaseForm.paid_amount) || 0
                    setPurchaseForm({
                      ...purchaseForm,
                      total_bill: e.target.value,
                      remaining_amount: (total - paid).toFixed(2),
                    })
                  }}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">ચૂકવેલ રકમ (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseForm.paid_amount}
                  onChange={(e) => {
                    const paid = parseFloat(e.target.value) || 0
                    const total = parseFloat(purchaseForm.total_bill) || 0
                    setPurchaseForm({
                      ...purchaseForm,
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
                  value={purchaseForm.remaining_amount}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : editingPurchaseId ? 'અપડેટ કરો' : 'ઉમેરો'}
              </button>
            </form>
          </div>

          {/* Purchases List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ખરીદીની યાદી</h3>
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {purchase.shops?.name || 'N/A'} - {purchase.items?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {purchase.quantity} {purchase.items?.unit || ''} × ₹{parseFloat(purchase.amount).toFixed(2)}
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        કુલ: ₹{parseFloat(purchase.total_bill).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {purchase.date} - {purchase.purchase_time}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          parseFloat(purchase.remaining_amount) > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          ચૂકવેલ: ₹{parseFloat(purchase.paid_amount).toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          parseFloat(purchase.remaining_amount) > 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          બાકી: ₹{parseFloat(purchase.remaining_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setEditingPurchaseId(purchase.id)
                          setPurchaseForm({
                            shop_id: purchase.shop_id,
                            item_id: purchase.item_id,
                            quantity: purchase.quantity.toString(),
                            amount: purchase.amount.toString(),
                            purchase_time: purchase.purchase_time,
                            date: purchase.date,
                            total_bill: purchase.total_bill.toString(),
                            paid_amount: purchase.paid_amount.toString(),
                            remaining_amount: purchase.remaining_amount.toString(),
                          })
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          const newPaid = prompt('નવી ચૂકવેલ રકમ દાખલ કરો:', purchase.paid_amount)
                          if (newPaid !== null) {
                            handlePaymentUpdate(purchase.id, parseFloat(newPaid))
                          }
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                      >
                        💰
                      </button>
                      <button
                        onClick={() => generatePurchasePDF(purchase, purchase.shops, purchase.items)}
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

      {/* Shops Tab */}
      {activeTab === 'shops' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingShopId ? 'દુકાન સંપાદિત કરો' : 'નવી દુકાન ઉમેરો'}
            </h2>

            <form onSubmit={handleShopSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">દુકાનનું નામ</label>
                <input
                  type="text"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">સંપર્ક નંબર (વૈકલ્પિક)</label>
                <input
                  type="tel"
                  value={shopForm.contact_number}
                  onChange={(e) => setShopForm({ ...shopForm, contact_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : editingShopId ? 'અપડેટ કરો' : 'ઉમેરો'}
              </button>

              {editingShopId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingShopId(null)
                    setShopForm({ name: '', contact_number: '' })
                  }}
                  className="w-full bg-gray-500 text-white font-bold py-4 rounded-xl text-lg"
                >
                  રદ કરો
                </button>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">દુકાનોની યાદી</h3>
            <DragDropContext onDragEnd={handleShopDragEnd}>
              <Droppable droppableId="shops">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {shops.map((shop, index) => (
                      <Draggable key={shop.id} draggableId={shop.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{shop.name}</p>
                              {shop.contact_number && (
                                <p className="text-sm text-gray-600">{shop.contact_number}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <div {...provided.dragHandleProps} className="cursor-move text-2xl">
                                ☰
                              </div>
                              <button
                                onClick={() => {
                                  setEditingShopId(shop.id)
                                  setShopForm({
                                    name: shop.name,
                                    contact_number: shop.contact_number || '',
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

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingItemId ? 'વસ્તુ સંપાદિત કરો' : 'નવી વસ્તુ ઉમેરો'}
            </h2>

            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">વસ્તુનું નામ</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">માપન એકમ</label>
                <select
                  value={itemForm.unit}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="KG">કિલો (KG)</option>
                  <option value="Liter">લીટર (Liter)</option>
                  <option value="Piece">ટુકડો (Piece)</option>
                  <option value="Packet">પેકેટ (Packet)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : editingItemId ? 'અપડેટ કરો' : 'ઉમેરો'}
              </button>

              {editingItemId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(null)
                    setItemForm({ name: '', unit: 'KG' })
                  }}
                  className="w-full bg-gray-500 text-white font-bold py-4 rounded-xl text-lg"
                >
                  રદ કરો
                </button>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">વસ્તુઓની યાદી</h3>
            <DragDropContext onDragEnd={handleItemDragEnd}>
              <Droppable droppableId="items">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-600">માપન: {item.unit}</p>
                            </div>
                            <div className="flex space-x-2">
                              <div {...provided.dragHandleProps} className="cursor-move text-2xl">
                                ☰
                              </div>
                              <button
                                onClick={() => {
                                  setEditingItemId(item.id)
                                  setItemForm({
                                    name: item.name,
                                    unit: item.unit,
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
    </div>
  )
}

