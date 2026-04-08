import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function parseUserAgent(userAgent: string) {
  if (userAgent.includes('Chrome')) {
    if (userAgent.includes('Windows')) {
      return 'Chrome on Windows';
    } else if (userAgent.includes('macOS') || userAgent.includes('Macintosh')) {
      return 'Chrome on macOS';
    } else if (userAgent.includes('Linux')) {
      return 'Chrome on Linux';
    } else if (userAgent.includes('Mobile')) {
      return 'Chrome on Mobile';
    }
  } else if (userAgent.includes('Safari')) {
    if (userAgent.includes('macOS') || userAgent.includes('Macintosh')) {
      return 'Safari on macOS';
    } else if (userAgent.includes('Mobile')) {
      return 'Safari on Mobile';
    }
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Edge')) {
    return 'Edge';
  }
  return 'Unknown';
}

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

    // 创建登录历史记录
    if (!testMode) {
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const deviceInfo = parseUserAgent(userAgent);

      // 首先将所有登录历史标记为非当前
      await prisma.loginHistory.updateMany({
        where: { userId: user.id, isCurrent: true },
        data: { isCurrent: false }
      });

      // 创建新的登录历史记录
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip,
          userAgent,
          deviceInfo,
          isCurrent: true
        }
      });
    }

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
