import { NextRequest, NextResponse } from 'next/server';
import { MeetstreamAPI } from '@/lib/meetstream';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transcript = await MeetstreamAPI.getTranscript(params.id);
    return NextResponse.json(transcript);
  } catch (error) {
    console.error(`Failed to fetch transcript for bot ${params.id}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch transcript for bot ${params.id} from Meetstream.ai` },
      { status: 500 }
    );
  }
} 