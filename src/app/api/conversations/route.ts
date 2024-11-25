import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { conversations } from '@/db/schema';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(conversations.lastMessageAt.desc());

    return NextResponse.json(userConversations);
  } catch (error) {
    console.error('[CONVERSATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const [conversation] = await db
      .insert(conversations)
      .values({
        userId,
        name: 'New Conversation',
      })
      .returning();

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('[CONVERSATIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
