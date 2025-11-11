import jsPDF from 'jspdf'

// We need to register Noto Sans font for Gujarati support
const NotoSansGujarati = 'AAEAAAATAQAABAAwRFNJRx5opZ4AAhfcAAATjE9TLzJzF5XPAAABfAAAAGBjbWFwBFwE0gAAB9gAAAQ6Z2x5ZvlBnpwAAAuYAAATTGhlYWQWeVTbAAAA/AAAADZoaGVhB+cD7QAAATQAAAAkaG10eNDNH9EAAAHQAAABOGxvY2GXGUEwAAAKQAAAATxtYXhwANMAjwAAAVgAAAAgbmFtZXomXqcAAByUAAADBHBvc3T+cwB0AAAflAAAACAAAQAAAAEAALgF+sVfDzz1AAkD6AAAAADZZVpfAAAAANllWl7/j/7aBFoDYQAAAAkAAgAAAAAAAAABAAADYf7iAAAEk//j/+wEWgABAAAAAAAAAAAAAAAAAAAALAABAAABADIAJwAWAEEABQACAAAAAQABAAAAQAAuAIAAAwAAAAIQAMgCvAAAAtQAyAK8AAAB9AAAACgAAAAzAAAAQwWGFgAAAQAFAAAAAAAAAAAAAwgCygOsAAAAAP/9AAAAAAAACvIVvQAAAAAL8hXVAAAAAAAAAAAAAAAACNgAAATKAAABMgAAATIAAAG2AAABtgAAAhIAAAISAAABCQAAAQkAAAEJAAADdwAAA3cAAAGXAAABlwAAA3cAAAFAAAABQAAAAUAAAAFAAAACEgAAASEAAAHXAAAB1wAAAeoAAAEEAAABBAAAAY4AAAGOAAABQAAAAMcAAADHAAAAggAAAbYAAAG2AAABugAAAboAAAEJAAABCQAAANsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAwAAABwAAQAAAAAAAAACAAAAAwAAABQAAwABAAAAHAAEADIAAAAGAAQAAQACACAAUf//AAAAIAAA//8AAGABAAEAAAAAAAAAAAEGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgBEAAABKgKaAAMABwALAA8AEwAXAAATMxEjEzMRIxMzESMBMxEjATMRIxMzESNEPj4+Pj4+Pj4BLj4+AS0/Pz4+PgKa/mYBmv5mAZr+ZgGa/mYBmv5mAZr+ZgACADD/9AHvAsgAFwAvAAATNDYzMhYVFA4DBwYVFBYzMjY1NCYnJjcOASMiJjU0PgM3NjU0JiMiBhUUFhcWgTo0NDsuQEg/IQ4pJCUsEA4TMA4qGTQ6LkBIPyEOKSQlLBAOEwJPND0+NCNBNi0kFRgYJCYqJQ8aDxQ1Fxc9NCNBNi0kFRgYJCYqJQ8aDxQAAQAAAAEAADxRyuNfDzz1AAMEAP/////ZZU66/////9llTroAAP+PBFoDYQAAAAgAAgABAAAAAAAAAAAAAAAAAAABLAAEASUAAAAAAAABvAAAAZAAAATKAAABMgAAATIAAAG2AAABtgAAAhIAAAISAAABCQAAAQkAAAEJAAADdwAAA3cAAAGXAAABlwAAA3cAAAFAAAABQAAAAUAAAAFAAAACEgAAASEAAAHXAAAB1wAAA'

// Function to add Gujarati font to jsPDF
const addGujaratiFontToDoc = (doc: jsPDF) => {
  doc.addFileToVFS('gujarati.ttf', NotoSansGujarati)
  doc.addFont('gujarati.ttf', 'Gujarati', 'normal')
  doc.setFont('Gujarati')
}

export const generateSalesPDF = async (sale: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  })
  
  // Add and set Gujarati font
  addGujaratiFontToDoc(doc)
  
  // Set encoding for Gujarati text
  doc.setFont('Gujarati', 'normal')
  doc.setFontSize(20)
  const textWidth = doc.getStringUnitWidth('સુરતી ખમણ') * doc.getFontSize() / doc.internal.scaleFactor
  const x = (doc.internal.pageSize.width - textWidth) / 2
  doc.text('સુરતી ખમણ', x, 20)
  
  doc.setFontSize(16)
  doc.text('વેચાણ બિલ', 105, 30, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`તારીખ: ${sale.date}`, 20, 50)
  doc.text(`કુલ રકમ: ₹${parseFloat(sale.total_amount).toFixed(2)}`, 20, 60)
  
  doc.save(`વેચાણ-${sale.date}.pdf`)
}

export const generatePurchasePDF = async (purchase: any, shop: any, item: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  })
  
  // Add and set Gujarati font
  addGujaratiFontToDoc(doc)
  doc.setFont('Gujarati', 'normal')
  
  // Helper function for centered text
  const centerText = (text: string, y: number, fontSize: number) => {
    doc.setFontSize(fontSize)
    const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor
    const x = (doc.internal.pageSize.width - textWidth) / 2
    doc.text(text, x, y)
  }
  
  centerText('સુરતી ખમણ', 20, 20)
  
  doc.setFontSize(16)
  doc.text('ખરીદી બિલ', 105, 30, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`દુકાન: ${shop?.name || 'N/A'}`, 20, 50)
  doc.text(`વસ્તુ: ${item?.name || 'N/A'}`, 20, 60)
  doc.text(`પ્રમાણ: ${purchase.quantity} ${item?.unit || ''}`, 20, 70)
  doc.text(`રકમ: ₹${parseFloat(purchase.amount).toFixed(2)}`, 20, 80)
  doc.text(`કુલ બિલ: ₹${parseFloat(purchase.total_bill).toFixed(2)}`, 20, 90)
  doc.text(`ચૂકવેલ: ₹${parseFloat(purchase.paid_amount).toFixed(2)}`, 20, 100)
  doc.text(`બાકી: ₹${parseFloat(purchase.remaining_amount).toFixed(2)}`, 20, 110)
  doc.text(`તારીખ: ${purchase.date}`, 20, 120)
  doc.text(`સમય: ${purchase.purchase_time}`, 20, 130)
  
  doc.save(`ખરીદી-${purchase.date}.pdf`)
}

export const generateBulkSalePDF = async (sale: any, customer: any, product: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  })
  
  // Add and set Gujarati font
  addGujaratiFontToDoc(doc)
  doc.setFont('Gujarati', 'normal')
  
  // Helper function for centered text
  const centerText = (text: string, y: number, fontSize: number) => {
    doc.setFontSize(fontSize)
    const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor
    const x = (doc.internal.pageSize.width - textWidth) / 2
    doc.text(text, x, y)
  }
  
  centerText('સુરતી ખમણ', 20, 20)
  
  doc.setFontSize(16)
  doc.text('બલ્ક વેચાણ બિલ', 105, 30, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`ગ્રાહક: ${customer?.shop_name || 'N/A'}`, 20, 50)
  doc.text(`માલિક: ${customer?.owner_name || 'N/A'}`, 20, 60)
  doc.text(`વસ્તુ: ${product?.name || 'N/A'}`, 20, 70)
  doc.text(`પ્રમાણ: ${sale.quantity} KG`, 20, 80)
  doc.text(`કિંમત/કિલો: ₹${parseFloat(sale.price_per_kg).toFixed(2)}`, 20, 90)
  doc.text(`કુલ રકમ: ₹${parseFloat(sale.total_amount).toFixed(2)}`, 20, 100)
  doc.text(`ચૂકવેલ: ₹${parseFloat(sale.paid_amount).toFixed(2)}`, 20, 110)
  doc.text(`બાકી: ₹${parseFloat(sale.remaining_amount).toFixed(2)}`, 20, 120)
  doc.text(`તારીખ: ${sale.date}`, 20, 130)
  
  doc.save(`બલ્ક-વેચાણ-${sale.date}.pdf`)
}

export const generateWorkerReportPDF = async (worker: any, attendance: any[], advances: any[], payments: any[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  })
  
  // Add and set Gujarati font
  addGujaratiFontToDoc(doc)
  doc.setFont('Gujarati', 'normal')
  
  // Helper function for centered text
  const centerText = (text: string, y: number, fontSize: number) => {
    doc.setFontSize(fontSize)
    const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor
    const x = (doc.internal.pageSize.width - textWidth) / 2
    doc.text(text, x, y)
  }
  
  centerText('સુરતી ખમણ', 20, 20)
  
  doc.setFontSize(16)
  doc.text('કામદાર રિપોર્ટ', 105, 30, { align: 'center' })
  
  doc.setFontSize(12)
  let yPos = 50
  doc.text(`નામ: ${worker.name}`, 20, yPos)
  yPos += 10
  doc.text(`સંપર્ક: ${worker.contact_number || 'N/A'}`, 20, yPos)
  yPos += 10
  doc.text(`દિવસ/પગાર: ₹${parseFloat(worker.per_day_salary).toFixed(2)}`, 20, yPos)
  yPos += 10
  
  const presentDays = attendance.filter(a => a.is_present).length
  const totalSalary = presentDays * parseFloat(worker.per_day_salary)
  const totalAdvances = advances.reduce((sum, a) => sum + parseFloat(a.amount), 0)
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const remaining = totalSalary - totalAdvances - totalPayments
  
  doc.text(`હાજરી: ${presentDays} દિવસ`, 20, yPos)
  yPos += 10
  doc.text(`કુલ પગાર: ₹${totalSalary.toFixed(2)}`, 20, yPos)
  yPos += 10
  doc.text(`કુલ અગાઉથી: ₹${totalAdvances.toFixed(2)}`, 20, yPos)
  yPos += 10
  doc.text(`કુલ ચૂકવેલ: ₹${totalPayments.toFixed(2)}`, 20, yPos)
  yPos += 10
  doc.text(`બાકી: ₹${remaining.toFixed(2)}`, 20, yPos)
  
  doc.save(`કામદાર-${worker.name}.pdf`)
}

