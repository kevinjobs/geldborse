import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';

const AVATAR_STYLES: Record<number, string> = {
  1: 'adventurer', 2: 'avataaars', 3: 'bottts', 4: 'fun-emoji',
  5: 'identicon', 6: 'lorelei', 7: 'micah', 8: 'notionists',
  9: 'open-peeps', 10: 'personas', 11: 'pixel-art', 12: 'rings',
  13: 'shapes', 14: 'thumbs', 15: 'croodles', 16: 'big-smile',
};

const AVATAR_SEEDS: Record<number, string> = {
  1: 'Mia', 2: 'Max', 3: 'Luna', 4: 'Felix',
  5: 'Nova', 6: 'Oscar', 7: 'Ivy', 8: 'Finn',
  9: 'Ella', 10: 'Leo', 11: 'Zara', 12: 'Kai',
  13: 'Ruby', 14: 'Jade', 15: 'Ash', 16: 'Sky',
};

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, avatarPreset, avatarData, avatarType } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData: { name: string; avatar?: string } = { name };

    if (avatarPreset) {
      const style = AVATAR_STYLES[avatarPreset as number];
      const seed = AVATAR_SEEDS[avatarPreset as number];
      if (style && seed) {
        const dicebearRes = await fetch(`https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`);
        if (dicebearRes.ok) {
          const svg = await dicebearRes.text();
          const base64 = Buffer.from(svg).toString('base64');
          updateData.avatar = `data:image/svg+xml;base64,${base64}`;
        }
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
