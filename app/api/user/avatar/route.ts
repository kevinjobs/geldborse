import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 从认证中获取用户ID
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 });
    }

    // 验证文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // 将文件转换为base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    // 更新用户头像
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: dataUrl },
    });

    return NextResponse.json({ 
      user: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        name: updatedUser.name,
        avatar: updatedUser.avatar 
      } 
    }, { status: 200 });
  } catch (error) {
    console.error('Update avatar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}