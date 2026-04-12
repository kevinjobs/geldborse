import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const { name } = await request.json();

    // 验证输入
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // 从认证中获取用户ID
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    return NextResponse.json({ user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name } }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
