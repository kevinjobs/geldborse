import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/is-admin'
import bcrypt from 'bcrypt'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 })
  }

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: { accounts: true, loginHistories: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 })
  }

  try {
    const { id } = await params
    const { email, name, isAdmin: isAdminInput, password, newPassword } = await request.json()

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
      updateData.email = email
    }

    if (name !== undefined) {
      updateData.name = name
    }

    if (typeof isAdminInput === 'boolean') {
      updateData.isAdmin = isAdminInput
    }

    if (password && newPassword) {
      const passwordMatch = await bcrypt.compare(password, existing.password)
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'Forbidden' ? 403 : 401 })
  }

  try {
    const { id } = await params

    if (id === auth.userId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}