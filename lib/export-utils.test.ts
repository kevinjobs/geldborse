import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Ensure `document` is available (bun test doesn't load vitest setup files / jsdom)
if (typeof document === "undefined") {
  const mockFn = (impl?: (...args: any[]) => any) => vi.fn(impl)
  ;(globalThis as any).document = {
    createElement: mockFn((tag: string) => {
      const el: any = {
        style: {},
        classList: { add: mockFn(), remove: mockFn(), contains: mockFn(() => false) },
        appendChild: mockFn(),
        removeChild: mockFn(),
        querySelector: mockFn(),
        querySelectorAll: mockFn(() => []),
        setAttribute: mockFn(),
        getAttribute: mockFn(),
        removeAttribute: mockFn(),
        addEventListener: mockFn(),
        removeEventListener: mockFn(),
        click: mockFn(),
        focus: mockFn(),
        blur: mockFn(),
        id: "",
        className: "",
        innerHTML: "",
        textContent: "",
        nodeName: tag.toUpperCase(),
        nodeType: 1,
        childNodes: [],
        parentNode: null,
      }
      return el
    }),
    getElementById: mockFn(),
    querySelector: mockFn(),
    querySelectorAll: mockFn(() => []),
    addEventListener: mockFn(),
    removeEventListener: mockFn(),
    head: { appendChild: mockFn(), removeChild: mockFn() },
    body: { appendChild: mockFn(), removeChild: mockFn() },
  } as unknown as Document
}

// Ensure `Image` is available (bun test doesn't provide browser globals)
if (typeof Image === "undefined") {
  class MockImage {
    src = ""
    width = 0
    height = 0
  }
  Object.defineProperty(MockImage.prototype, "onload", {
    value: null,
    writable: true,
    configurable: true,
  })
  ;(globalThis as any).Image = MockImage
}

// Ensure `FileReader` is available (bun test doesn't provide browser globals)
if (typeof FileReader === "undefined") {
  ;(globalThis as any).FileReader = class FileReader {
    result: any = null
    error: any = null
    onload: (() => void) | null = null
    onerror: (() => void) | null = null

    readAsText(blob: Blob) {
      blob
        .text()
        .then((text) => {
          this.result = text
          if (this.onload) this.onload()
        })
        .catch((err: any) => {
          this.error = err
          if (this.onerror) this.onerror()
        })
    }

    readAsArrayBuffer(blob: Blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = buf
          if (this.onload) this.onload()
        })
        .catch((err: any) => {
          this.error = err
          if (this.onerror) this.onerror()
        })
    }
  }
}

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
    let originalCreateElement: any
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
      originalCreateElement = document.createElement.bind(document)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document.createElement = (() => fakeLink) as any
    })

    afterEach(() => {
      document.createElement = originalCreateElement
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
    let originalCreateElement: any
    let fakeLink: { click: ReturnType<typeof vi.fn>; href: string; download: string }

    beforeEach(() => {
      fakeLink = {
        click: vi.fn(),
        href: "",
        download: "",
      }
      originalCreateElement = document.createElement.bind(document)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document.createElement = (() => fakeLink) as any
    })

    afterEach(() => {
      document.createElement = originalCreateElement
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
