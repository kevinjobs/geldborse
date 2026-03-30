import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Test mode - for testing only
let testMode = false;
let testUser: { id: string; email: string; password: string; name?: string } | null = null;
let testError: Error | null = null;
let testPasswordMatch = false;

export function setTestMode(enabled: boolean) {
  testMode = enabled;
}

export function setTestUser(user: any) {
  testUser = user;
}

export function setTestError(error: any) {
  testError = error;
}

export function setTestPasswordMatch(match: boolean) {
  testPasswordMatch = match;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 查找用户
    let user;
    if (testMode) {
      if (testError) {
        throw testError;
      }
      user = testUser;
    } else {
      user = await prisma.user.findUnique({ where: { email } });
    }
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 验证密码
    let passwordMatch;
    if (testMode) {
      passwordMatch = testPasswordMatch;
    } else {
      passwordMatch = await bcrypt.compare(password, user.password);
    }
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
