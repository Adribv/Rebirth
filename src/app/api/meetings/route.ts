import { NextRequest, NextResponse } from 'next/server';
import { MeetstreamAPI, meetstreamUtils } from '@/lib/meetstream';
import { prisma } from '@/lib/prisma';
import { ApiResponse, CreateMeetingRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'meetstream' or 'database'

    if (source === 'meetstream') {
      // Fetch meetings from Meetstream.ai
      const meetstreamMeetings = await MeetstreamAPI.getBots();
      
      return NextResponse.json<ApiResponse>({
        success: true,
        data: meetstreamMeetings
      });
    } else {
      // Fetch meetings from database
      const meetings = await prisma.meeting.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          contents: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true
            }
          }
        }
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        data: meetings
      });
    }

  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch meetings'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMeetingRequest = await request.json();
    const { title, description, meetingId, transcript, duration, participants, metadata } = body;

    // Validate required fields
    if (!title || !meetingId || !transcript) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Title, meeting ID, and transcript are required'
      }, { status: 400 });
    }

    // Extract topics and action items from transcript
    const topics = meetstreamUtils.extractTopics(transcript);
    const actionItems = meetstreamUtils.extractActionItems(transcript);

    // Create meeting record in database
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        meetingId,
        transcript,
        duration,
        participants,
        status: 'COMPLETED',
        metadata: {
          ...metadata,
          topics,
          actionItems,
          durationFormatted: meetstreamUtils.formatDuration(duration)
        },
        userId: 'temp-user-id', // TODO: Get from authentication
      }
    });

    // Create analytics record
    await prisma.analytics.create({
      data: {
        type: 'REAL_TIME_STATS',
        data: {
          meetingId: meeting.id,
          duration: duration,
          participants: participants.length,
          topics,
          actionItems,
          wordCount: transcript.split(' ').length
        },
        userId: 'temp-user-id', // TODO: Get from authentication
      }
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: meeting,
      message: 'Meeting created successfully'
    });

  } catch (error) {
    console.error('Failed to create meeting:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create meeting'
    }, { status: 500 });
  }
} 