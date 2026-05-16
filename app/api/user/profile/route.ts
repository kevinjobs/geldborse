import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, avatarPresetUrl, avatarData, avatarType } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData: { name: string; avatar?: string } = { name };

    if (avatarPresetUrl) {
      const dicebearRes = await fetch(avatarPresetUrl);
      if (dicebearRes.ok) {
        const svg = await dicebearRes.text();
        const base64 = Buffer.from(svg).toString('base64');
        updateData.avatar = `data:image/svg+xml;base64,${base64}`;
      }
    } else if (avatarData) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (avatarType && !validTypes.includes(avatarType)) {
        return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 });
      }
      updateData.avatar = avatarData;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
