import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { conversations } from '@/db/schema';

interface RouteParams {
  params: {
    conversationId: string;
  };
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name } = await req.json();
    const { conversationId } = params;

    const [conversation] = await db
      .update(conversations)
      .set({ name })
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .returning();

    if (!conversation) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('[CONVERSATION_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { conversationId } = params;

    const [conversation] = await db
      .delete(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .returning();

    if (!conversation) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('[CONVERSATION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
