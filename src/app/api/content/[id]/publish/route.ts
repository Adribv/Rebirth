import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { platform } = await request.json();

    // Fetch the content
    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
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

    // Generate platform-specific URLs (simplified to avoid long URLs)
    const publishUrls = {
      medium: 'https://medium.com/new-story',
      devto: 'https://dev.to/new',
      hashnode: 'https://hashnode.com/new',
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/'
    };

    const url = publishUrls[platform as keyof typeof publishUrls];
    
    if (!url) {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      );
    }

    // Update content status to published
    await prisma.content.update({
      where: { id: params.id },
      data: { status: 'PUBLISHED' }
    });

    // Return content data for the frontend to handle
    return NextResponse.json({
      success: true,
      url,
      platform,
      content: {
        title: content.title,
        content: content.content,
        tags: content.tags || [],
        summary: content.summary
      },
      message: `Redirecting to ${platform}...`
    });

  } catch (error) {
    console.error('Failed to publish content:', error);
    return NextResponse.json(
      { error: 'Failed to publish content' },
      { status: 500 }
    );
  }
} 