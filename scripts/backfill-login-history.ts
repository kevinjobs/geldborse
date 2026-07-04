import "dotenv/config"
import { prisma } from "../lib/prisma"
import { parseUserAgent } from "../lib/ua-parser"
import { getLocationFromIP } from "../lib/ip-geo"

async function main() {
  console.log("=== Login History Backfill Script ===\n")

  // Find all records missing deviceFingerprint
  const records = await prisma.loginHistory.findMany({
    where: { deviceFingerprint: null },
    orderBy: { loginAt: "desc" },
  })

  console.log(`Found ${records.length} records to backfill.\n`)

  let updated = 0
  let errors = 0

  for (const record of records) {
    try {
      const parsed = parseUserAgent(record.userAgent)
      const location = await getLocationFromIP(record.ip)

      await prisma.loginHistory.update({
        where: { id: record.id },
        data: {
          deviceFingerprint: parsed.fingerprint,
          deviceInfo: parsed.deviceName,
          location,
        },
      })

      updated++
      console.log(
        `[${updated}/${records.length}] ${record.id} — ${parsed.deviceName} | ${location ?? "no location"}`
      )
    } catch (err) {
      errors++
      console.error(`[ERROR] ${record.id}:`, err)
    }
  }

  console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
