import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock xlsx
vi.mock("xlsx", () => ({
  utils: {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

// Mock jspdf
vi.mock("jspdf", () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}))

// Mock modern-screenshot
vi.mock("modern-screenshot", () => ({
  domToPng: vi.fn(() => Promise.resolve("data:image/png;base64,fake")),
  domToJpeg: vi.fn(() => Promise.resolve("data:image/jpeg;base64,fake")),
}))

// Import after mocks
import {
  exportToXLSX,
  exportToCSV,
  exportToPDF,
  exportToJPG,
  type ExportFormat,
} from "./export-utils"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import { domToPng, domToJpeg } from "modern-screenshot"

// Type-level check (compile-time only)
const _formatCheck: ExportFormat = "xlsx"
const _formatCheck2: ExportFormat = "pdf"
const _formatCheck3: ExportFormat = "jpg"
const _formatCheck4: ExportFormat = "csv"
void _formatCheck
void _formatCheck2
void _formatCheck3
void _formatCheck4

// Helper: read a Blob's content in jsdom.
// jsdom's Blob lacks .text()/.arrayBuffer(), so use FileReader.readAsText.
// NOTE: readAsText strips the UTF-8 BOM per spec, so BOM presence must be
// checked separately via readAsArrayBuffer.
function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

// Read the raw first bytes of a Blob to detect the BOM (readAsText strips it).
function readBlobFirstCharCode(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const view = new Uint8Array(reader.result as ArrayBuffer)
      // UTF-8 BOM = 0xEF 0xBB 0xBF → decode as one code point 0xFEFF
      if (view.length >= 3 && view[0] === 0xef && view[1] === 0xbb && view[2] === 0xbf) {
        resolve(0xfeff)
      } else {
        resolve(view[0])
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })
}

describe("export-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("ExportFormat type", () => {
    it("includes all four formats (xlsx, pdf, jpg, csv)", () => {
      const formats: ExportFormat[] = ["xlsx", "pdf", "jpg", "csv"]
      expect(formats).toHaveLength(4)
      expect(formats).toContain("xlsx")
      expect(formats).toContain("pdf")
      expect(formats).toContain("jpg")
      expect(formats).toContain("csv")
    })
  })

  describe("exportToXLSX", () => {
    it("calls XLSX.utils.aoa_to_sheet with the data", () => {
      const data = [
        ["name", "amount"],
        ["account1", 100],
      ]
      exportToXLSX(data, "资产快照")

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledWith(data)
    })

    it("calls XLSX.utils.book_new and book_append_sheet with default sheet name", () => {
      exportToXLSX([["a"]], "report")

      expect(XLSX.utils.book_new).toHaveBeenCalled()
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        {},
        {},
        "Sheet1"
      )
    })

    it("writes file with dated filename matching Name_YYYY-MM-DD.xlsx", () => {
      exportToXLSX([["a"]], "SheetName", "MySheet")

      expect(XLSX.writeFile).toHaveBeenCalledTimes(1)
      const writtenName = (XLSX.writeFile as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as string
      // Pattern: SheetName_YYYY-MM-DD.xlsx
      expect(writtenName).toMatch(/^SheetName_\d{4}-\d{2}-\d{2}\.xlsx$/)

      // Verify the date portion is today
      const datePart = writtenName.match(/_(\d{4}-\d{2}-\d{2})\./)![1]
      const today = new Date().toISOString().split("T")[0]
      expect(datePart).toBe(today)
    })

    it("passes custom sheet name to book_append_sheet", () => {
      exportToXLSX([["a"]], "report", "CustomSheet")

      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        {},
        {},
        "CustomSheet"
      )
    })
  })

  describe("exportToCSV", () => {
    let createObjectURL: ReturnType<typeof vi.fn>
    let revokeObjectURL: ReturnType<typeof vi.fn>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let createElementSpy: any
    let fakeLink: { click: ReturnType<typeof vi.fn>; href: string; download: string }

    beforeEach(() => {
      createObjectURL = vi.fn(() => "blob:fake-url")
      revokeObjectURL = vi.fn()
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        configurable: true,
        writable: true,
      })
      Object.defineProperty(URL, "revokeObjectURL", {
        value: revokeObjectURL,
        configurable: true,
        writable: true,
      })

      fakeLink = {
        click: vi.fn(),
        href: "",
        download: "",
      }
      createElementSpy = vi
        .spyOn(document, "createElement")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockImplementation((() => fakeLink) as any)
    })

    afterEach(() => {
      createElementSpy.mockRestore()
    })

    it("creates a blob URL via URL.createObjectURL and revokes it", () => {
      exportToCSV([["a", "b"]], "report")

      expect(createObjectURL).toHaveBeenCalledTimes(1)
      expect(revokeObjectURL).toHaveBeenCalledTimes(1)
    })

    it("sets the download attribute to a dated CSV filename", () => {
      exportToCSV([["a"]], "report")

      expect(fakeLink.download).toMatch(/^report_\d{4}-\d{2}-\d{2}\.csv$/)
    })

    it("triggers a download click", () => {
      exportToCSV([["a"]], "report")

      expect(fakeLink.click).toHaveBeenCalledTimes(1)
    })

    it("includes BOM in the blob content", async () => {
      let capturedBlob: Blob | undefined
      createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return "blob:fake-url"
      })
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        configurable: true,
        writable: true,
      })

      exportToCSV([["a", "b"]], "report")

      expect(capturedBlob).toBeDefined()
      // BOM is \uFEFF (charCode 0xFEFF) — check via raw bytes since
      // readAsText strips the UTF-8 BOM per spec.
      const firstChar = await readBlobFirstCharCode(capturedBlob!)
      expect(firstChar).toBe(0xfeff)
      const text = await readBlobText(capturedBlob!)
      expect(text).toBe("a,b")
    })

    it("wraps cells containing commas in quotes", async () => {
      let capturedBlob: Blob | undefined
      createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return "blob:fake-url"
      })
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        configurable: true,
        writable: true,
      })

      exportToCSV([["hello,world", "normal"]], "report")

      // readAsText strips the BOM, so no slice(1) needed
      const csv = await readBlobText(capturedBlob!)
      expect(csv).toBe('"hello,world",normal')
    })

    it("escapes quotes in cells by doubling them and wrapping in quotes", async () => {
      let capturedBlob: Blob | undefined
      createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return "blob:fake-url"
      })
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        configurable: true,
        writable: true,
      })

      exportToCSV([['say "hi"', "x"]], "report")

      const csv = await readBlobText(capturedBlob!)
      expect(csv).toBe('"say ""hi""",x')
    })

    it("wraps cells containing newlines in quotes", async () => {
      let capturedBlob: Blob | undefined
      createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return "blob:fake-url"
      })
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        configurable: true,
        writable: true,
      })

      exportToCSV([["line1\nline2", "x"]], "report")

      const csv = await readBlobText(capturedBlob!)
      expect(csv).toBe('"line1\nline2",x')
    })

    it("joins rows with newlines", async () => {
      let capturedBlob: Blob | undefined
      createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return "blob:fake-url"
      })
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        configurable: true,
        writable: true,
      })

      exportToCSV(
        [
          ["a", "b"],
          ["c", "d"],
        ],
        "report"
      )

      const csv = await readBlobText(capturedBlob!)
      expect(csv).toBe("a,b\nc,d")
    })

    it("converts numbers to strings", async () => {
      let capturedBlob: Blob | undefined
      createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return "blob:fake-url"
      })
      Object.defineProperty(URL, "createObjectURL", {
        value: createObjectURL,
        configurable: true,
        writable: true,
      })

      exportToCSV([[1, 2.5, 100]], "report")

      const csv = await readBlobText(capturedBlob!)
      expect(csv).toBe("1,2.5,100")
    })
  })

  describe("exportToPDF", () => {
    let onloadSetterSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      // Mock Image.prototype.onload so it resolves immediately when set
      onloadSetterSpy = vi
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(Image.prototype as any, "onload", "set")
        .mockImplementation(function (this: HTMLImageElement, fn: (() => void) | null) {
          if (fn) fn()
        })
    })

    afterEach(() => {
      onloadSetterSpy.mockRestore()
    })

    it("calls domToPng with the element and scale options", async () => {
      const element = document.createElement("div")

      await exportToPDF(element, "report")

      expect(domToPng).toHaveBeenCalledWith(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      })
    })

    it("constructs jsPDF and calls save with a dated PDF filename", async () => {
      const element = document.createElement("div")

      await exportToPDF(element, "report")

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const mockInstance = (jsPDF as unknown as ReturnType<typeof vi.fn>).mock
        .results[0].value as {
        addImage: ReturnType<typeof vi.fn>
        save: ReturnType<typeof vi.fn>
      }
      expect(mockInstance.addImage).toHaveBeenCalled()
      expect(mockInstance.save).toHaveBeenCalledTimes(1)
      const savedName = mockInstance.save.mock.calls[0][0] as string
      expect(savedName).toMatch(/^report_\d{4}-\d{2}-\d{2}\.pdf$/)
    })
  })

  describe("exportToJPG", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let createElementSpy: any
    let fakeLink: { click: ReturnType<typeof vi.fn>; href: string; download: string }

    beforeEach(() => {
      fakeLink = {
        click: vi.fn(),
        href: "",
        download: "",
      }
      createElementSpy = vi
        .spyOn(document, "createElement")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockImplementation((() => fakeLink) as any)
    })

    afterEach(() => {
      createElementSpy.mockRestore()
    })

    it("calls domToJpeg with the element and quality options", async () => {
      const element = document.createElement("div")

      await exportToJPG(element, "report")

      expect(domToJpeg).toHaveBeenCalledWith(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        quality: 0.95,
      })
    })

    it("sets download to a dated JPG filename and triggers click", async () => {
      const element = document.createElement("div")

      await exportToJPG(element, "report")

      expect(fakeLink.download).toMatch(/^report_\d{4}-\d{2}-\d{2}\.jpg$/)
      expect(fakeLink.href).toBe("data:image/jpeg;base64,fake")
      expect(fakeLink.click).toHaveBeenCalledTimes(1)
    })
  })
})
