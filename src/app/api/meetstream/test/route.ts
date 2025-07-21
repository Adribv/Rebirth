import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // Prevent this debug endpoint from running in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    console.log('[TEST] Testing Meetstream API connection');
    console.log('[TEST] API Key exists:', !!process.env.MEETSTREAM_API_KEY);
    console.log('[TEST] API Key length:', process.env.MEETSTREAM_API_KEY?.length || 0);
    console.log('[TEST] Base URL:', process.env.MEETSTREAM_BASE_URL || 'https://api.meetstream.ai');

    // Try different authorization formats
    const authFormats = [
      `Bearer ${process.env.MEETSTREAM_API_KEY}`,
      `Token ${process.env.MEETSTREAM_API_KEY}`,
      `Basic ${Buffer.from(process.env.MEETSTREAM_API_KEY + ':').toString('base64')}`,
      process.env.MEETSTREAM_API_KEY
    ];

    let lastError = null;
    
    for (const authHeader of authFormats) {
      try {
        console.log('[TEST] Trying auth format:', authHeader?.substring(0, 20) + '...');
        
        const response = await axios.get('https://api.meetstream.ai/bots', {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        console.log('[TEST] API Response status:', response.status);
        console.log('[TEST] API Response data:', response.data);

        return NextResponse.json({
          success: true,
          message: 'Meetstream API connection successful',
          authFormat: authHeader?.substring(0, 20) + '...',
          data: response.data
        });
      } catch (error: any) {
        console.log('[TEST] Auth format failed:', authHeader?.substring(0, 20) + '...', error.response?.status, error.response?.data?.message);
        lastError = error;
      }
    }

    // If all formats failed, return the last error
    console.error('[TEST] All auth formats failed');
    console.error('[TEST] Last error:', lastError?.response?.data);
    console.error('[TEST] Last error status:', lastError?.response?.status);

    return NextResponse.json({
      success: false,
      message: 'All authentication formats failed',
      error: lastError?.message,
      details: lastError?.response?.data,
      status: lastError?.response?.status
    }, { status: 500 });
  } catch (error: any) {
    console.error('[TEST] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      message: 'Unexpected error occurred',
      error: error.message
    }, { status: 500 });
  }
} 