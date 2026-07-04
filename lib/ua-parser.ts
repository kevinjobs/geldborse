/**
 * Lightweight user-agent parser for device fingerprinting.
 * No external dependencies — regex-based extraction.
 *
 * Browser detection order matters:
 * OPR/Opera → Edge → Firefox → Samsung → Safari → Chrome
 * (Edge UA contains "Chrome", Opera UA contains "Chrome" and "OPR/")
 */

export interface ParsedUA {
  browser: string
  browserVersion: string
  os: string
  deviceType: "desktop" | "mobile" | "tablet"
  fingerprint: string
  deviceName: string
}

export function parseUserAgent(ua: string): ParsedUA {
  // --- Browser (order matters!) ---
  let browser = "Unknown"
  let browserVersion = "0"

  if (/(?:OPR|Opera)\/(\d+)/.test(ua)) {
    const m = ua.match(/(?:OPR|Opera)\/(\d+)/)
    browser = "Opera"
    browserVersion = m?.[1] ?? "0"
  } else if (/Edg(?:e|A|iOS)?\/(\d+)/.test(ua)) {
    const m = ua.match(/Edg(?:e|A|iOS)?\/(\d+)/)
    browser = "Edge"
    browserVersion = m?.[1] ?? "0"
  } else if (/Firefox\/(\d+)/.test(ua)) {
    const m = ua.match(/Firefox\/(\d+)/)
    browser = "Firefox"
    browserVersion = m?.[1] ?? "0"
  } else if (/SamsungBrowser\/(\d+)/.test(ua)) {
    const m = ua.match(/SamsungBrowser\/(\d+)/)
    browser = "Samsung Browser"
    browserVersion = m?.[1] ?? "0"
  } else if (/Version\/(\d+).*Safari/.test(ua) && !/Chrome/.test(ua)) {
    const m = ua.match(/Version\/(\d+).*Safari/)
    browser = "Safari"
    browserVersion = m?.[1] ?? "0"
  } else if (/Chrome\/(\d+)/.test(ua)) {
    const m = ua.match(/Chrome\/(\d+)/)
    browser = "Chrome"
    browserVersion = m?.[1] ?? "0"
  }

  // --- OS ---
  let os = "Unknown"
  if (/Windows NT 10|Windows NT 11/.test(ua)) os = "Windows"
  else if (/Mac OS X/.test(ua)) os = "macOS"
  else if (/Android/.test(ua)) os = "Android"
  else if (/iPhone OS|iPad/.test(ua)) os = "iOS"
  else if (/CrOS/.test(ua)) os = "ChromeOS"
  else if (/Linux/.test(ua)) os = "Linux"

  // --- Device Type ---
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop"
  if (/iPad|Android.*Tablet/.test(ua)) {
    deviceType = "tablet"
  } else if (/Mobile|Android(?!.*Tablet)|iPhone/.test(ua)) {
    deviceType = "mobile"
  }

  // --- Fingerprint & Device Name ---
  const browserLower = browser.toLowerCase()
  const osLower = os.toLowerCase()
  const fingerprint = `${browserLower}-${browserVersion}-${osLower}-${deviceType}`
  const deviceName = `${browser} ${browserVersion} · ${os}`

  return { browser, browserVersion, os, deviceType, fingerprint, deviceName }
}
