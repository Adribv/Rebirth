import { NextRequest, NextResponse } from 'next/server';
import { MeetstreamAPI } from '@/lib/meetstream';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/meetstream/bots - Starting request');
    
    // For now, we'll use a default user ID since authentication isn't implemented yet
    // In a real app, you'd get this from the authenticated user session
    const defaultUserId = '507f1f77bcf86cd799439011'; // Default MongoDB ObjectId
    
    const bots = await DatabaseService.getBotsByUserId(defaultUserId);
    
    // Transform database bots to match frontend interface
    const transformedBots = bots.map((bot: any) => ({
      bot_id: bot.botId,
      name: bot.name,
      meeting_url: bot.meetingUrl,
      status: bot.status,
      created_at: bot.createdAt.toISOString(),
      updated_at: bot.updatedAt.toISOString(),
      transcript_id: bot.transcriptId
    }));
    
    console.log('[API] GET /api/meetstream/bots - Success:', transformedBots);
    return NextResponse.json(transformedBots);
  } catch (error: any) {
    console.error('[API] GET /api/meetstream/bots - Error:', error);
    console.error('[API] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return NextResponse.json(
      { error: 'Failed to fetch bots', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/meetstream/bots - Starting request');
    const body = await request.json();
    console.log('[API] POST /api/meetstream/bots - Request body:', body);
    
    // Create bot in Meetstream.ai
    const meetstreamBot = await MeetstreamAPI.createBot(body);
    console.log('[API] Meetstream bot created:', meetstreamBot);
    
    // For now, we'll use a default user ID since authentication isn't implemented yet
    const defaultUserId = '507f1f77bcf86cd799439011'; // Default MongoDB ObjectId
    
    // Save bot to database
    const dbBot = await DatabaseService.createBot({
      botId: meetstreamBot.bot_id,
      name: body.name,
      meetingUrl: body.meeting_url,
      status: meetstreamBot.status || 'JOINING',
      transcriptId: meetstreamBot.transcript_id,
      transcriptionType: body.transcription_type === 'realtime' ? 'REALTIME' : 'POST_MEETING',
      userId: defaultUserId
    });
    
    console.log('[API] Bot saved to database:', dbBot);
    
    // Return the bot data in the format expected by the frontend
    const responseBot = {
      bot_id: meetstreamBot.bot_id,
      name: body.name,
      meeting_url: body.meeting_url,
      status: meetstreamBot.status || 'JOINING',
      created_at: dbBot.createdAt.toISOString(),
      updated_at: dbBot.updatedAt.toISOString(),
      transcript_id: meetstreamBot.transcript_id
    };
    
    console.log('[API] POST /api/meetstream/bots - Success:', responseBot);
    return NextResponse.json(responseBot);
  } catch (error: any) {
    console.error('[API] POST /api/meetstream/bots - Error:', error);
    console.error('[API] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return NextResponse.json(
      { error: 'Failed to create bot', details: error.message },
      { status: 500 }
    );
  }
} 