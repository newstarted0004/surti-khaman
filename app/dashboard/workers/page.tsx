'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { generateWorkerReportPDF } from '@/lib/pdf'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState<'workers' | 'attendance' | 'advances' | 'payments'>('workers')
  const [workers, setWorkers] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [advances, setAdvances] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Worker form
  const [workerForm, setWorkerForm] = useState({
    name: '',
    contact_number: '',
    per_day_salary: '',
  })
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null)

  // Advance form
  const [advanceForm, setAdvanceForm] = useState({
    worker_id: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  })

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    worker_id: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedWorker) {
      fetchWorkerData(selectedWorker)
    }
  }, [selectedWorker])

  const fetchData = async () => {
    await Promise.all([fetchWorkers()])
  }

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setWorkers(data || [])
    } catch (error) {
      console.error('Error fetching workers:', error)
    }
  }

  const fetchWorkerData = async (workerId: string) => {
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

    try {
      const [attendanceRes, advancesRes, paymentsRes] = await Promise.all([
        supabase
          .from('worker_attendance')
          .select('*')
          .eq('worker_id', workerId)
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .order('date', { ascending: false }),
        supabase
          .from('worker_advances')
          .select('*')
          .eq('worker_id', workerId)
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .order('date', { ascending: false }),
        supabase
          .from('worker_salary_payments')
          .select('*')
          .eq('worker_id', workerId)
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .order('date', { ascending: false }),
      ])

      setAttendance(attendanceRes.data || [])
      setAdvances(advancesRes.data || [])
      setPayments(paymentsRes.data || [])
    } catch (error) {
      console.error('Error fetching worker data:', error)
    }
  }

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingWorkerId) {
        const { error } = await supabase
          .from('workers')
          .update({
            ...workerForm,
            per_day_salary: parseFloat(workerForm.per_day_salary),
          })
          .eq('id', editingWorkerId)

        if (error) throw error
        alert('કામદાર સફળતાપૂર્વક અપડેટ થયો!')
        setEditingWorkerId(null)
      } else {
        const maxOrder = workers.length > 0 ? Math.max(...workers.map(w => w.display_order || 0)) : 0
        const { error } = await supabase
          .from('workers')
          .insert({
            ...workerForm,
            per_day_salary: parseFloat(workerForm.per_day_salary),
            display_order: maxOrder + 1,
          })

        if (error) throw error
        alert('કામદાર સફળતાપૂર્વક ઉમેરાયો!')
      }

      setWorkerForm({ name: '', contact_number: '', per_day_salary: '' })
      fetchWorkers()
    } catch (error) {
      console.error('Error saving worker:', error)
      alert('ભૂલ: કામદાર સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceToggle = async (workerId: string, date: string) => {
    try {
      // Check if attendance exists
      const { data: existing } = await supabase
        .from('worker_attendance')
        .select('*')
        .eq('worker_id', workerId)
        .eq('date', date)
        .single()

      if (existing) {
        // Toggle attendance
        const { error } = await supabase
          .from('worker_attendance')
          .update({ is_present: !existing.is_present })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Create new attendance
        const { error } = await supabase
          .from('worker_attendance')
          .insert({
            worker_id: workerId,
            date,
            is_present: true,
          })

        if (error) throw error
      }

      if (selectedWorker) {
        fetchWorkerData(selectedWorker)
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      alert('ભૂલ: હાજરી અપડેટ કરવામાં સમસ્યા')
    }
  }

  const handleAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('worker_advances')
        .insert({
          worker_id: advanceForm.worker_id,
          amount: parseFloat(advanceForm.amount),
          date: advanceForm.date,
          description: advanceForm.description,
        })

      if (error) throw error
      alert('અગાઉથી રકમ સફળતાપૂર્વક ઉમેરાઈ!')
      setAdvanceForm({
        worker_id: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
      })
      if (selectedWorker) {
        fetchWorkerData(selectedWorker)
      }
    } catch (error) {
      console.error('Error saving advance:', error)
      alert('ભૂલ: અગાઉથી રકમ સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('worker_salary_payments')
        .insert({
          worker_id: paymentForm.worker_id,
          amount: parseFloat(paymentForm.amount),
          date: paymentForm.date,
          description: paymentForm.description,
        })

      if (error) throw error
      alert('પગાર ચૂકવણી સફળતાપૂર્વક ઉમેરાઈ!')
      setPaymentForm({
        worker_id: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
      })
      if (selectedWorker) {
        fetchWorkerData(selectedWorker)
      }
    } catch (error) {
      console.error('Error saving payment:', error)
      alert('ભૂલ: પગાર ચૂકવણી સેવ કરવામાં સમસ્યા')
    } finally {
      setLoading(false)
    }
  }

  const handleWorkerDragEnd = async (result: any) => {
    if (!result.destination) return

    const newWorkers = Array.from(workers)
    const [reorderedWorker] = newWorkers.splice(result.source.index, 1)
    newWorkers.splice(result.destination.index, 0, reorderedWorker)

    setWorkers(newWorkers)

    for (let i = 0; i < newWorkers.length; i++) {
      await supabase
        .from('workers')
        .update({ display_order: i + 1 })
        .eq('id', newWorkers[i].id)
    }
  }

  const calculateWorkerStats = (worker: any) => {
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

    const workerAttendance = attendance.filter(a => a.worker_id === worker.id && a.is_present)
    const workerAdvances = advances.filter(a => a.worker_id === worker.id)
    const workerPayments = payments.filter(p => p.worker_id === worker.id)

    const presentDays = workerAttendance.length
    const perDaySalary = parseFloat(worker.per_day_salary) || 0
    const totalSalary = presentDays * perDaySalary
    const totalAdvances = workerAdvances.reduce((sum, a) => sum + parseFloat(a.amount), 0)
    const totalPayments = workerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const remaining = totalSalary - totalAdvances - totalPayments

    return {
      presentDays,
      totalSalary,
      totalAdvances,
      totalPayments,
      remaining,
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('workers')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'workers'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            કામદારો
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            હાજરી
          </button>
          <button
            onClick={() => setActiveTab('advances')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'advances'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            અગાઉથી
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-shrink-0 py-2 px-4 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            પગાર
          </button>
        </div>
      </div>

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingWorkerId ? 'કામદાર સંપાદિત કરો' : 'નવો કામદાર ઉમેરો'}
            </h2>

            <form onSubmit={handleWorkerSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">નામ</label>
                <input
                  type="text"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">સંપર્ક નંબર (વૈકલ્પિક)</label>
                <input
                  type="tel"
                  value={workerForm.contact_number}
                  onChange={(e) => setWorkerForm({ ...workerForm, contact_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">દિવસ/પગાર (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={workerForm.per_day_salary}
                  onChange={(e) => setWorkerForm({ ...workerForm, per_day_salary: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : editingWorkerId ? 'અપડેટ કરો' : 'ઉમેરો'}
              </button>

              {editingWorkerId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingWorkerId(null)
                    setWorkerForm({ name: '', contact_number: '', per_day_salary: '' })
                  }}
                  className="w-full bg-gray-500 text-white font-bold py-4 rounded-xl text-lg"
                >
                  રદ કરો
                </button>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">કામદારોની યાદી</h3>
            <DragDropContext onDragEnd={handleWorkerDragEnd}>
              <Droppable droppableId="workers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {workers.map((worker, index) => {
                      const stats = calculateWorkerStats(worker)
                      return (
                        <Draggable key={worker.id} draggableId={worker.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border-2 border-indigo-200"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-bold text-gray-800 text-lg">{worker.name}</p>
                                  {worker.contact_number && (
                                    <p className="text-sm text-gray-600">{worker.contact_number}</p>
                                  )}
                                  <p className="text-sm text-gray-600">
                                    દિવસ/પગાર: ₹{parseFloat(worker.per_day_salary).toFixed(2)}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm">
                                      <span className="font-semibold">હાજરી:</span> {stats.presentDays} દિવસ
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-semibold">કુલ પગાર:</span> ₹{stats.totalSalary.toFixed(2)}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-semibold">કુલ અગાઉથી:</span> ₹{stats.totalAdvances.toFixed(2)}
                                    </p>
                                    <p className="text-sm">
                                      <span className="font-semibold">કુલ ચૂકવેલ:</span> ₹{stats.totalPayments.toFixed(2)}
                                    </p>
                                    <p className={`text-sm font-bold ${
                                      stats.remaining >= 0 ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                      <span>બાકી:</span> ₹{stats.remaining.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <div {...provided.dragHandleProps} className="cursor-move text-2xl">
                                    ☰
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditingWorkerId(worker.id)
                                      setWorkerForm({
                                        name: worker.name,
                                        contact_number: worker.contact_number || '',
                                        per_day_salary: worker.per_day_salary.toString(),
                                      })
                                      window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const workerAttendance = attendance.filter(a => a.worker_id === worker.id)
                                      const workerAdvances = advances.filter(a => a.worker_id === worker.id)
                                      const workerPayments = payments.filter(p => p.worker_id === worker.id)
                                      await generateWorkerReportPDF(worker, workerAttendance, workerAdvances, workerPayments)
                                    }}
                                    className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                                  >
                                    📄
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">હાજરી માર્ક કરો</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">કામદાર પસંદ કરો</label>
                <select
                  value={selectedWorker || ''}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                >
                  <option value="">કામદાર પસંદ કરો</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">તારીખ</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                />
              </div>

              {selectedWorker && (
                <button
                  onClick={() => handleAttendanceToggle(selectedWorker, selectedDate)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl"
                >
                  હાજરી માર્ક કરો/હટાવો
                </button>
              )}
            </div>
          </div>

          {selectedWorker && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">હાજરીની યાદી</h3>
              <div className="space-y-2">
                {attendance
                  .filter(a => a.worker_id === selectedWorker)
                  .map((att) => (
                    <div
                      key={att.id}
                      className={`p-3 rounded-xl ${
                        att.is_present
                          ? 'bg-green-100 border-2 border-green-300'
                          : 'bg-red-100 border-2 border-red-300'
                      }`}
                    >
                      <p className="font-semibold">
                        {format(new Date(att.date), 'dd/MM/yyyy')} - {att.is_present ? 'હાજર' : 'ગેરહાજર'}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advances Tab */}
      {activeTab === 'advances' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">અગાઉથી રકમ ઉમેરો</h2>

            <form onSubmit={handleAdvanceSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">કામદાર</label>
                <select
                  value={advanceForm.worker_id}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, worker_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">કામદાર પસંદ કરો</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">રકમ (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">તારીખ</label>
                <input
                  type="date"
                  value={advanceForm.date}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">વર્ણન (વૈકલ્પિક)</label>
                <textarea
                  value={advanceForm.description}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : 'ઉમેરો'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">અગાઉથી રકમની યાદી</h3>
            <div className="space-y-2">
              {advances.map((adv) => {
                const worker = workers.find(w => w.id === adv.worker_id)
                return (
                  <div key={adv.id} className="bg-red-50 p-3 rounded-xl border-2 border-red-200">
                    <p className="font-semibold">{worker?.name || 'N/A'}</p>
                    <p className="text-lg font-bold text-red-700">₹{parseFloat(adv.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{format(new Date(adv.date), 'dd/MM/yyyy')}</p>
                    {adv.description && (
                      <p className="text-sm text-gray-600 mt-1">{adv.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">પગાર ચૂકવણી ઉમેરો</h2>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">કામદાર</label>
                <select
                  value={paymentForm.worker_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, worker_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">કામદાર પસંદ કરો</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">રકમ (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">તારીખ</label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">વર્ણન (વૈકલ્પિક)</label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'સેવ થઈ રહ્યું છે...' : 'ઉમેરો'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">પગાર ચૂકવણીની યાદી</h3>
            <div className="space-y-2">
              {payments.map((payment) => {
                const worker = workers.find(w => w.id === payment.worker_id)
                return (
                  <div key={payment.id} className="bg-green-50 p-3 rounded-xl border-2 border-green-200">
                    <p className="font-semibold">{worker?.name || 'N/A'}</p>
                    <p className="text-lg font-bold text-green-700">₹{parseFloat(payment.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{format(new Date(payment.date), 'dd/MM/yyyy')}</p>
                    {payment.description && (
                      <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

