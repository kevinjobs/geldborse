import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/auth"
import { generateApiKey, validateScopes, EXPIRES_IN_MS } from "@/lib/api-key"

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request, { rejectApiKey: true })
  if (auth instanceof NextResponse) return auth

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, prefix: true, scopes: true, isActive: true, lastUsedAt: true, expiresAt: true, createdAt: true },
  })

  return NextResponse.json({ apiKeys })
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request, { rejectApiKey: true })
  if (auth instanceof NextResponse) return auth

  const { name, scopes: rawScopes, expiresIn } = await request.json()

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "密钥名称不能为空" }, { status: 400 })
  }

  const scopeErr = validateScopes(rawScopes || [])
  if (scopeErr) {
    return NextResponse.json({ error: scopeErr }, { status: 400 })
  }

  let expiresAt: Date | null = null
  if (expiresIn && EXPIRES_IN_MS[expiresIn as keyof typeof EXPIRES_IN_MS] !== undefined) {
    const ms = EXPIRES_IN_MS[expiresIn as keyof typeof EXPIRES_IN_MS]
    if (ms !== null) expiresAt = new Date(Date.now() + ms)
  }

  const { fullKey, prefix, keyHash } = generateApiKey()

  const apiKey = await prisma.apiKey.create({
    data: {
      name: name.trim(),
      prefix,
      keyHash,
      scopes: JSON.stringify([...new Set(rawScopes)]),
      expiresAt,
      userId: auth.userId,
    },
  })

  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    prefix: apiKey.prefix,
    scopes: JSON.parse(apiKey.scopes),
    expiresAt: apiKey.expiresAt,
    fullKey,
  })
}