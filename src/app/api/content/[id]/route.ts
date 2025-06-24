import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        meeting: {
          select: {
            id: true,
            title: true,
            meetingId: true
          }
        }
      }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.content.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      content: {
        ...content,
        views: content.views + 1 // Return updated view count
      }
    });

  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
} 