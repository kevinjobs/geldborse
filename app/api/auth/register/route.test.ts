import { describe, it, expect, beforeEach } from 'vitest'

// Import the route and test mode functions
import { POST, setTestMode, setTestExistingUser, setTestCreateResult, setTestError } from './route'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    // Reset test mode before each test
    setTestMode(false)
    setTestExistingUser(null)
    setTestCreateResult(null)
    setTestError(null)
  })

  it('should return 400 if email or password is missing', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: '', password: '' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email and password are required')
  })

  it('should return 400 if email already exists', async () => {
    const existingUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
    }
    setTestMode(true)
    setTestExistingUser(existingUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email already exists')
  })

  it('should create user and return 201 on successful registration', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
    }
    setTestMode(true)
    setTestExistingUser(null)
    setTestCreateResult(mockUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test User' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    })
  })

  it('should create user without name if not provided', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: '',
    }
    setTestMode(true)
    setTestExistingUser(null)
    setTestCreateResult(mockUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: '',
    })
  })

  it('should return 500 on internal server error', async () => {
    setTestMode(true)
    setTestExistingUser(null)
    setTestError(new Error('Database error'))

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
