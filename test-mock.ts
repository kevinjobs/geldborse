import { vi } from 'vitest'

// Create mock function
const mockFindUnique = vi.fn()

// Mock Prisma before importing
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: mockFindUnique,
    },
  })),
}))

// Import after mocking
import { PrismaClient } from '@prisma/client'

// Test the mock
const prisma = new PrismaClient()

console.log('Prisma client created:', prisma)
console.log('Prisma user findUnique:', prisma.user.findUnique)
console.log('mockFindUnique:', mockFindUnique)

// Test calling the mock
prisma.user.findUnique({ where: { email: 'test@example.com' } })
console.log('mockFindUnique calls after test:', mockFindUnique.mock.calls)
