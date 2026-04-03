import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Test mode - for testing only
let testMode = false;
let testExistingUser: { id: string; email: string; password: string; name?: string } | null = null;
let testCreateResult: { id: string; email: string; password: string; name?: string } | null = null;
let testError: Error | null = null;

export function setTestMode(enabled: boolean) {
  testMode = enabled;
}

export function setTestExistingUser(user: any) {
  testExistingUser = user;
}

export function setTestCreateResult(result: any) {
  testCreateResult = result;
}

export function setTestError(error: any) {
  testError = error;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 检查用户是否已存在
    let existingUser;
    if (testMode) {
      existingUser = testExistingUser;
    } else {
      existingUser = await prisma.user.findUnique({ where: { email } });
    }
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    let user;
    if (testMode) {
      if (testError) {
        throw testError;
      }
      user = testCreateResult;
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || '',
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
