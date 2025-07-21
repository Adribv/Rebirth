import { NextRequest, NextResponse } from 'next/server';
import { MeetstreamAPI } from '@/lib/meetstream';
import { DatabaseService } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API] DELETE /api/meetstream/bots/[id] - Starting request');
    console.log('[API] Bot ID:', params.id);
    
    // Remove bot from Meetstream.ai
    await MeetstreamAPI.removeBot(params.id);
    console.log('[API] Bot removed from Meetstream.ai');
    
    // Remove bot from database
    await DatabaseService.deleteBot(params.id);
    console.log('[API] Bot removed from database');
    
    return NextResponse.json({ success: true, message: 'Bot removed successfully' });
  } catch (error: any) {
    console.error('[API] DELETE /api/meetstream/bots/[id] - Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove bot', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API] GET /api/meetstream/bots/[id] - Starting request');
    console.log('[API] Bot ID:', params.id);
    
    // Get bot details from database
    const bot = await DatabaseService.getBotByBotId(params.id);
    
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }
    
    // Transform to match frontend interface
    const responseBot = {
      bot_id: bot.botId,
      name: bot.name,
      meeting_url: bot.meetingUrl,
      status: bot.status,
      created_at: bot.createdAt.toISOString(),
      updated_at: bot.updatedAt.toISOString(),
      transcript_id: bot.transcriptId
    };
    
    return NextResponse.json(responseBot);
  } catch (error: any) {
    console.error('[API] GET /api/meetstream/bots/[id] - Error:', error);
    return NextResponse.json(
      { error: 'Failed to get bot', details: error.message },
      { status: 500 }
    );
  }
} 