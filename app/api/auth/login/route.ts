import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { parseUserAgent } from '@/lib/ua-parser';
import { getLocationFromIP } from '@/lib/ip-geo';

// Test mode - for testing only
let testMode = false;
let testUser: { id: string; email: string; password: string; name?: string | null; avatar?: string | null; isAdmin?: boolean } | null = null;
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
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests, please try again later' }, { status: 429 })
    }

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
      const parsed = parseUserAgent(userAgent);
      const location = await getLocationFromIP(ip);

      await prisma.$transaction([
        // 首先将所有登录历史标记为非当前
        prisma.loginHistory.updateMany({
          where: { userId: user.id, isCurrent: true },
          data: { isCurrent: false }
        }),
        // 创建新的登录历史记录
        prisma.loginHistory.create({
          data: {
            userId: user.id,
            ip,
            userAgent,
            deviceInfo: parsed.deviceName,
            deviceFingerprint: parsed.fingerprint,
            location,
            isCurrent: true
          }
        })
      ]);
    }

    const token = await signToken(user.id)

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, isAdmin: user.isAdmin } },
      { status: 200 }
    )

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
