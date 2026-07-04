import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import { domToPng, domToJpeg } from "modern-screenshot"

// Type
export type ExportFormat = "xlsx" | "pdf" | "jpg" | "csv"

// Helper: generate filename with date suffix
// e.g. "资产快照" + "xlsx" → "资产快照_2026-07-04.xlsx"
function getDatedFileName(name: string, ext: string): string {
  const date = new Date().toISOString().split("T")[0]
  return `${name}_${date}.${ext}`
}

// Export to XLSX (uses xlsx library)
// Same logic as current exportToXLSX but with dated filename
export function exportToXLSX(
  data: (string | number)[][],
  fileName: string,
  sheetName: string = "Sheet1"
): void {
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, getDatedFileName(fileName, "xlsx"))
}

// Export to CSV
// Convert 2D array to CSV string with proper escaping, download as blob
export function exportToCSV(
  data: (string | number)[][],
  fileName: string
): void {
  const csvContent = data
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell)
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(",")
    )
    .join("\n")
  // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = getDatedFileName(fileName, "csv")
  link.click()
  URL.revokeObjectURL(url)
}

// Export to PDF (uses modern-screenshot + jspdf)
// Same logic as current exportToPDF but with dated filename
export async function exportToPDF(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const dataUrl = await domToPng(element, {
    scale: 2,
    backgroundColor: "#ffffff",
  })
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })
  const imgWidth = 210
  const img = new Image()
  img.src = dataUrl
  await new Promise((resolve) => {
    img.onload = resolve
  })
  const imgHeight = (img.height * imgWidth) / img.width
  pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight)
  pdf.save(getDatedFileName(fileName, "pdf"))
}

// Export to JPG (uses modern-screenshot)
// Same logic as current exportToJPG but with dated filename
export async function exportToJPG(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const dataUrl = await domToJpeg(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    quality: 0.95,
  })
  const link = document.createElement("a")
  link.download = getDatedFileName(fileName, "jpg")
  link.href = dataUrl
  link.click()
}
