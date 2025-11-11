import jsPDF from 'jspdf'

// Helper: convert ArrayBuffer -> base64 (browser)
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
}

// Flexible font loader: try multiple candidate filenames (user may have added custom fonts to public/fonts)
const loadAndUseFont = async (doc: jsPDF, filename: string) => {
  try {
    const url = `/fonts/${filename}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const buffer = await res.arrayBuffer()
    const base64 = arrayBufferToBase64(buffer)
    const family = filename.replace(/\.[^/.]+$/, '')
    doc.addFileToVFS(filename, base64)
    doc.addFont(filename, family, 'normal')
    doc.setFont(family)
    return true
  } catch (err) {
    return false
  }
}

// Ensure a Gujarati-capable font is loaded. Tries user-supplied names first, then falls back to common filenames.
const ensureGujaratiFont = async (doc: jsPDF, candidates: string[] = []) => {
  const key = '_gujaratiFontLoaded'
  if ((doc as any)[key]) return

  // default candidates (in order)
  const defaultCandidates = [
    ...candidates,
    'NotoSansGujarati-Regular.ttf',
    'NotoSansGujarati.ttf',
    'MuktaMahee-Regular.ttf',
    'Lohit-Gujarati.ttf'
  ]

  let loaded = false
  for (const name of defaultCandidates) {
    if (!name) continue
    // eslint-disable-next-line no-await-in-loop
    loaded = await loadAndUseFont(doc, name)
    if (loaded) break
  }

  ;(doc as any)[key] = loaded
  if (!loaded) console.warn('No Gujarati font loaded; PDFs will use default font and Gujarati may not render correctly.')
}

const createDoc = () => new jsPDF()

// Draw a simple border around the page
const drawBorder = (doc: jsPDF, margin = 8) => {
  const w = doc.internal.pageSize.width
  const h = doc.internal.pageSize.height
  doc.setDrawColor(60)
  doc.setLineWidth(0.6)
  doc.rect(margin, margin, w - margin * 2, h - margin * 2)
}

// Draw header occupying full width with subtle background
const drawHeader = (doc: jsPDF, shopName?: string, subtitle?: string) => {
  const pageWidth = doc.internal.pageSize.width
  const headerHeight = 44
  // light background across the top (respect page margins to avoid edge artifacts)
  const margin = 8
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, 0, pageWidth - margin * 2, headerHeight, 'F')

  // shop name
  doc.setFontSize(20)
  if (shopName) {
    doc.text(shopName, pageWidth / 2, 16, { align: 'center' })
  }

  // subtitle under shop name
  if (subtitle) {
    doc.setFontSize(12)
    doc.text(subtitle, pageWidth / 2, 28, { align: 'center' })
  }

  // subtle divider line
  doc.setDrawColor(200)
  doc.setLineWidth(0.3)
  doc.line(8, headerHeight, pageWidth - 8, headerHeight)
}

// Draw a simple table. columns: [{key, label, width}] widths in mm
const drawTable = (doc: jsPDF, startX: number, startY: number, columns: { key: string; label: string; width: number }[], rows: any[]) : number => {
  const rowHeight = 8
  let y = startY

  // ensure table fits within page width; if not, scale columns proportionally
  const pageWidth = doc.internal.pageSize.width
  const rightMargin = 12
  const availableWidth = pageWidth - startX - rightMargin
  const totalColWidth = columns.reduce((s, c) => s + (c.width || 0), 0)
  let adjustedCols = columns
  if (totalColWidth > availableWidth && totalColWidth > 0) {
    const scale = availableWidth / totalColWidth
    adjustedCols = columns.map(c => ({ ...c, width: c.width * scale }))
  }

  // header background
  doc.setFillColor(230, 230, 230)
  let x = startX
  for (const col of adjustedCols) {
    doc.rect(x, y, col.width, rowHeight, 'F')
    doc.setTextColor(20)
    doc.setFontSize(11)
    doc.text(col.label, x + 2, y + 6)
    x += col.width
  }

  // rows
  y += rowHeight
  let odd = false
  for (const row of rows) {
    x = startX
    if (odd) doc.setFillColor(250, 250, 250)
    else doc.setFillColor(255, 255, 255)
    for (const col of adjustedCols) {
      doc.rect(x, y, col.width, rowHeight, 'F')
      doc.setTextColor(10)
      doc.setFontSize(11)
      const text = row[col.key] != null ? String(row[col.key]) : ''
      doc.text(text, x + 2, y + 6)
      x += col.width
    }
    y += rowHeight
    odd = !odd
  }
  // return y position after table (useful for placing totals)
  return y
}

export const generateSalesPDF = async (sale: any) => {
  const doc = createDoc()
  await ensureGujaratiFont(doc)
  // Styling
  drawBorder(doc)
  drawHeader(doc, sale.shopName || 'સુરતી ખમણ', 'વેચાણ બિલ')

  // small info at right (date/time/invoice)
  drawRightInfo(doc, [`તારીખ: ${sale.date}`, `સમય: ${sale.time || ''}`], 18)

  doc.setFontSize(12)
  const topY = 36
  doc.text(`ગ્રાહક: ${sale.customerName || 'N/A'}`, 20, topY + 6)

  // Totals box on the right
  const totals: { label: string; value: string }[] = []
  totals.push({ label: 'કુલ રકમ', value: `₹${parseFloat(sale.total_amount || 0).toFixed(2)}` })
  if (sale.paid_amount != null) totals.push({ label: 'ચૂકવેલ', value: `₹${parseFloat(sale.paid_amount || 0).toFixed(2)}` })
  if (sale.remaining_amount != null) totals.push({ label: 'બાકી', value: `₹${parseFloat(sale.remaining_amount || 0).toFixed(2)}` })
  if (totals.length) drawPaymentBox(doc, totals, topY)

  // Example items table if sale.items provided
  if (Array.isArray(sale.items) && sale.items.length) {
    // ensure widths fit A4 (210mm) with margins
    const cols = [
      { key: 'name', label: 'વસ્તુ', width: 70 },
      { key: 'qty', label: 'પ્રમાણ', width: 30 },
      { key: 'rate', label: 'કિંમત', width: 30 },
      { key: 'amount', label: 'રકમ', width: 40 }
    ]
    const rows = sale.items.map((it: any) => ({
      name: it.name,
      qty: `${it.quantity} ${it.unit || ''}`,
      rate: `₹${parseFloat(it.price || 0).toFixed(2)}`,
      amount: `₹${parseFloat(it.amount || 0).toFixed(2)}`
    }))
    drawTable(doc, 20, topY + 40, cols, rows)
  }

  doc.save(`વેચાણ-${sale.date}.pdf`)
}

export const generatePurchasePDF = async (purchase: any, shop: any, item: any) => {
  const doc = createDoc()
  await ensureGujaratiFont(doc)
  // Styling
  drawBorder(doc)
  drawHeader(doc, shop?.name || 'સુરતી ખમણ', shop?.address || shop?.phone || '')

  doc.setFontSize(12)
  const topY = 36
  doc.text(`દુકાન: ${shop?.name || 'N/A'}`, 20, topY + 6)

  // place date/time at top-right
  drawRightInfo(doc, [`તારીખ: ${purchase.date}`, `સમય: ${purchase.purchase_time}`], 18)

  // Table for purchased items (single `item` or array)
  const items = Array.isArray(purchase.items) ? purchase.items : (item ? [item] : [])
  const cols = [
    { key: 'name', label: 'વસ્તુ', width: 90 },
    { key: 'qty', label: 'પ્રમાણ', width: 30 },
    { key: 'rate', label: 'કિંમત', width: 30 },
    { key: 'amount', label: 'રકમ', width: 40 }
  ]
  const rows = items.map((it: any) => ({
    name: it.name || item?.name || 'N/A',
    qty: `${it.quantity || purchase.quantity || ''} ${it.unit || item?.unit || ''}`,
    rate: `₹${parseFloat(it.price || purchase.amount || 0).toFixed(2)}`,
    amount: `₹${parseFloat(it.amount || purchase.total_bill || 0).toFixed(2)}`
  }))
  let tableEndY = topY + 40
  if (rows.length) tableEndY = drawTable(doc, 20, topY + 40, cols, rows)

  // After items, render payment details as a small two-column table below the items
  const paymentsCols = [
    { key: 'label', label: 'વિવરણ', width: 110 },
    { key: 'value', label: 'રકમ', width: 60 }
  ]
  const paymentsRows = [
    { label: 'કુલ બિલ', value: `₹${parseFloat(purchase.total_bill || 0).toFixed(2)}` },
    { label: 'ચૂકવેલ', value: `₹${parseFloat(purchase.paid_amount || 0).toFixed(2)}` },
    { label: 'બાકી', value: `₹${parseFloat(purchase.remaining_amount || 0).toFixed(2)}` }
  ]
  drawTable(doc, 20, tableEndY + 8, paymentsCols, paymentsRows)

  doc.save(`ખરીદી-${purchase.date}.pdf`)
}

export const generateBulkSalePDF = async (sale: any, customer: any, product: any) => {
  const doc = createDoc()
  await ensureGujaratiFont(doc)
  // Styling
  drawBorder(doc)
  drawHeader(doc, customer?.shop_name || 'સુરતી ખમણ', customer?.owner_name || '')

  doc.setFontSize(12)
  const topY = 36
  doc.text(`માલિક: ${customer?.owner_name || 'N/A'}`, 20, topY + 6)
  doc.text(`વસ્તુ: ${product?.name || sale.productName || 'N/A'}`, 20, topY + 14)
  doc.text(`પ્રમાણ: ${sale.quantity || ''} ${sale.unit || 'KG'}`, 20, topY + 22)
  // date/time on right
  drawRightInfo(doc, [`તારીખ: ${sale.date}`, `સમય: ${sale.time || ''}`], 18)

  // Items: either sale.items array or a single product
  const items = Array.isArray(sale.items) ? sale.items : (product ? [{ name: product.name, quantity: sale.quantity, unit: sale.unit || 'KG', price: sale.price_per_kg, amount: sale.total_amount }] : [])
  const cols = [
    { key: 'name', label: 'વસ્તુ', width: 70 },
    { key: 'qty', label: 'પ્રમાણ', width: 30 },
    { key: 'rate', label: 'કિંમત', width: 30 },
    { key: 'amount', label: 'રકમ', width: 40 }
  ]
  const rows = items.map((it: any) => ({
    name: it.name || 'N/A',
    qty: `${it.quantity || ''} ${it.unit || ''}`,
    rate: `₹${parseFloat(it.price || sale.price_per_kg || 0).toFixed(2)}`,
    amount: `₹${parseFloat(it.amount || 0).toFixed(2)}`
  }))

  let tableEndY = topY + 40
  if (rows.length) tableEndY = drawTable(doc, 20, topY + 40, cols, rows)

  // After items, render payment details below the table
  const paymentsCols = [
    { key: 'label', label: 'વિવરણ', width: 110 },
    { key: 'value', label: 'રકમ', width: 60 }
  ]
  const paymentsRows = [
    { label: 'કુલ રકમ', value: `₹${parseFloat(sale.total_amount || 0).toFixed(2)}` },
    { label: 'ચૂકવેલ', value: `₹${parseFloat(sale.paid_amount || 0).toFixed(2)}` },
    { label: 'બાકી', value: `₹${parseFloat(sale.remaining_amount || 0).toFixed(2)}` }
  ]
  drawTable(doc, 20, tableEndY + 8, paymentsCols, paymentsRows)

  doc.save(`બલ્ક-વેચાણ-${sale.date}.pdf`)
}

// Draw right-aligned small info lines (e.g., date/time, invoice no) near header
const drawRightInfo = (doc: jsPDF, lines: string[], startY = 18, margin = 12) => {
  const pageWidth = doc.internal.pageSize.width
  doc.setFontSize(10)
  let y = startY
  for (const line of lines) {
    doc.text(line, pageWidth - margin, y, { align: 'right' })
    y += 6
  }
}

// Draw a totals box aligned to the right; totals is array of {label, value}
const drawTotalsBox = (doc: jsPDF, totals: { label: string; value: string }[], topY: number, boxWidth = 70, rightMargin = 12) => {
  // kept for backward-compatibility but make it lighter
  const pageWidth = doc.internal.pageSize.width
  const x = pageWidth - rightMargin - boxWidth
  const lineHeight = 7
  const boxHeight = lineHeight * totals.length + 6
  // background
  doc.setFillColor(250, 250, 250)
  doc.rect(x, topY, boxWidth, boxHeight, 'F')
  doc.setDrawColor(210)
  doc.setLineWidth(0.4)
  doc.rect(x, topY, boxWidth, boxHeight)
  // contents
  doc.setFontSize(10)
  let y = topY + 5
  for (const t of totals) {
    doc.text(t.label, x + 4, y)
    doc.text(t.value, x + boxWidth - 4, y, { align: 'right' })
    y += lineHeight
  }
}

// Draw a more professional payment box (subtotal, total, paid, balance) with larger TOTAL emphasis
const drawPaymentBox = (doc: jsPDF, payments: { label: string; value: string }[], topY: number, boxWidth = 86, rightMargin = 12) => {
  const pageWidth = doc.internal.pageSize.width
  const x = pageWidth - rightMargin - boxWidth
  const lineHeight = 9
  const boxHeight = lineHeight * payments.length + 12
  // subtle shadow/background
  doc.setFillColor(252, 252, 252)
  doc.rect(x, topY, boxWidth, boxHeight, 'F')
  // border
  doc.setDrawColor(180)
  doc.setLineWidth(0.6)
  doc.rect(x, topY, boxWidth, boxHeight)

  // draw each line; if label is 'TOTAL' emphasize
  let y = topY + 8
  for (const p of payments) {
    if (p.label.toLowerCase().includes('total') || p.label === 'કુલ રકમ') {
      doc.setFontSize(12)
      doc.setTextColor(20)
      doc.text(p.label, x + 6, y)
      doc.text(p.value, x + boxWidth - 6, y, { align: 'right' })
      doc.setTextColor(10)
    } else {
      doc.setFontSize(10)
      doc.setTextColor(10)
      doc.text(p.label, x + 6, y)
      doc.text(p.value, x + boxWidth - 6, y, { align: 'right' })
    }
    y += lineHeight
  }
}

export const generateWorkerReportPDF = async (
  worker: any,
  attendance: any[] = [],
  advances: any[] = [],
  payments: any[] = []
) => {
  const doc = createDoc()
  await ensureGujaratiFont(doc)

  drawBorder(doc)
  drawHeader(doc, worker?.shopName || 'સુરતી ખમણ', 'કામદાર રિપોર્ટ')

  doc.setFontSize(12)
  let yPos = 36
  // place report date/time on top-right
  drawRightInfo(doc, [`તારીખ: ${worker.reportDate || ''}`, `સમાય: ${worker.reportTime || ''}`], 18)

  doc.text(`નામ: ${worker.name || 'N/A'}`, 20, yPos)
  yPos += 8
  doc.text(`સંપર્ક: ${worker.contact_number || 'N/A'}`, 20, yPos)
  yPos += 8
  doc.text(`દરેક દિવસ પગાર: ₹${parseFloat(worker.per_day_salary || 0).toFixed(2)}`, 20, yPos)
  yPos += 12

  const presentDays = attendance.filter(a => a && a.is_present).length
  const totalSalary = presentDays * parseFloat(worker.per_day_salary || 0)
  const totalAdvances = advances.reduce((s, a) => s + parseFloat(a.amount || 0), 0)
  const totalPayments = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0)
  const remaining = totalSalary - totalAdvances - totalPayments

  const cols = [
    { key: 'label', label: 'વિવરણ', width: 100 },
    { key: 'value', label: 'મૂલ્ય', width: 90 }
  ]
  const rows = [
    { label: 'હાજરી (દિવસ)', value: `${presentDays}` },
    { label: 'કુલ પગાર', value: `₹${totalSalary.toFixed(2)}` },
    { label: 'કુલ આગળથી', value: `₹${totalAdvances.toFixed(2)}` },
    { label: 'કુલ ચુકવેલ', value: `₹${totalPayments.toFixed(2)}` },
    { label: 'બાકી', value: `₹${remaining.toFixed(2)}` }
  ]

  // draw the table and a payment box to the right
  drawTable(doc, 20, yPos + 4, cols, rows)
  drawPaymentBox(doc, [
    { label: 'કુલ પગાર', value: `₹${totalSalary.toFixed(2)}` },
    { label: 'કુલ અગાઉથી', value: `₹${totalAdvances.toFixed(2)}` },
    { label: 'કુલ ચુકવેલ', value: `₹${totalPayments.toFixed(2)}` },
    { label: 'બાકી', value: `₹${remaining.toFixed(2)}` }
  ], yPos + 4)

  doc.save(`કામદાર-${worker.name || 'report'}.pdf`)
}