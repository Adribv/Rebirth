import axios from 'axios';
import { MeetstreamTranscript, MeetstreamMeeting } from '@/types';

// For server-side, use regular env vars; for client-side, use NEXT_PUBLIC_ vars
const MEETSTREAM_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_MEETSTREAM_BASE_URL || 'https://api.meetstream.ai')
  : (process.env.MEETSTREAM_BASE_URL || 'https://api.meetstream.ai');

const MEETSTREAM_API_KEY = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_MEETSTREAM_API_KEY
  : process.env.MEETSTREAM_API_KEY;

const DEEPGRAM_API_KEY = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
  : process.env.DEEPGRAM_API_KEY;

// Debug: Log API key status (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  console.log('[Meetstream API] API Key configured:', !!MEETSTREAM_API_KEY);
  console.log('[Meetstream API] API Key length:', MEETSTREAM_API_KEY?.length || 0);
  console.log('[Meetstream API] Base URL:', MEETSTREAM_BASE_URL);
  console.log('[Meetstream API] Deepgram API Key configured:', !!DEEPGRAM_API_KEY);
}

// Only throw error if we're in a browser environment and the key is missing
if (typeof window !== 'undefined' && !MEETSTREAM_API_KEY) {
  console.error('MEETSTREAM_API_KEY is required for client-side operations');
}

// Create axios instance with default config
const meetstreamApi = axios.create({
  baseURL: MEETSTREAM_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add request interceptor for Token authentication
meetstreamApi.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Meetstream API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    // Add Token authentication header
    if (MEETSTREAM_API_KEY) {
      config.headers['Authorization'] = `Token ${MEETSTREAM_API_KEY}`;
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Meetstream API] Headers:', config.headers);
      console.log('[Meetstream API] Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('[Meetstream API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
meetstreamApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Meetstream API] Response error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export class MeetstreamAPI {
  /**
   * Check if API is properly configured
   */
  static isConfigured(): boolean {
    return !!MEETSTREAM_API_KEY;
  }

  /**
   * Create a meeting bot for real-time transcription
   */
  static async createBot(meetingData: {
    meeting_url: string;
    name: string;
    audio_required?: boolean;
    transcription_type?: 'realtime' | 'post_meeting';
    webhook_url?: string;
  }): Promise<any> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      // Transform the data to match Meetstream.ai API expectations based on Postman collection
      const requestBody = {
        meeting_link: meetingData.meeting_url,
        bot_name: meetingData.name,
        bot_message: "Content Rebirth Bot",
        audio_required: meetingData.audio_required ?? true,
        video_required: false,
        live_audio_required: {},
        live_transcription_required: {
          // Include webhook_url for real-time transcription
          ...(meetingData.transcription_type === 'realtime' && {
            webhook_url: meetingData.webhook_url || "https://webhook.site/your-webhook-url"
          })
        },
        // Include Deepgram transcription only if key is provided
        ...(DEEPGRAM_API_KEY && {
          transcription: {
            deepgram: {
              model: "nova-3",
              language: "en",
              api_key: DEEPGRAM_API_KEY
            }
          }
        }),
        custom_attributes: {
          transcription_type: meetingData.transcription_type || "post_meeting",
          source: "content-rebirth"
        },
        callback_url: ""
      };

      console.log('Creating bot with data:', requestBody);

      // Use the correct endpoint from Postman collection
      const response = await meetstreamApi.post('/api/v1/bots/create_bot', requestBody);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create meeting bot:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to create meeting bot in Meetstream.ai');
    }
  }

  /**
   * Get all bots (meetings)
   */
  static async getBots(): Promise<any[]> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      // Note: The /api/v1/bots endpoint doesn't exist in the current API version
      // Return an empty array for now, or implement a different approach
      console.log('[Meetstream API] getBots endpoint not available in current API version');
      return [];
    } catch (error) {
      console.error('Failed to fetch bots:', error);
      throw new Error('Failed to fetch bots from Meetstream.ai');
    }
  }

  /**
   * Get a specific bot by ID
   */
  static async getBot(botId: string): Promise<any> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      const response = await meetstreamApi.get(`/api/v1/bots/${botId}/detail`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch bot ${botId}:`, error);
      throw new Error(`Failed to fetch bot ${botId} from Meetstream.ai`);
    }
  }

  /**
   * Remove a bot from meeting
   */
  static async removeBot(botId: string): Promise<void> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      await meetstreamApi.get(`/api/v1/bots/${botId}/remove_bot`);
    } catch (error) {
      console.error(`Failed to remove bot ${botId}:`, error);
      throw new Error(`Failed to remove bot ${botId} from Meetstream.ai`);
    }
  }

  /**
   * Get transcript for a specific bot/meeting
   */
  static async getTranscript(botId: string): Promise<MeetstreamTranscript> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      // Note: The transcript endpoint might be different based on the Postman collection
      // You may need to get transcript_id from bot details first
      const response = await meetstreamApi.get(`/api/v1/bots/${botId}/get_transcript`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transcript for bot ${botId}:`, error);
      throw new Error(`Failed to fetch transcript for bot ${botId} from Meetstream.ai`);
    }
  }

  /**
   * Get audio for a specific bot/meeting
   */
  static async getAudio(botId: string): Promise<any> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      const response = await meetstreamApi.get(`/api/v1/bots/${botId}/get_audio`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch audio for bot ${botId}:`, error);
      throw new Error(`Failed to fetch audio for bot ${botId} from Meetstream.ai`);
    }
  }

  /**
   * Get real-time WebSocket URL for audio streaming
   */
  static getRealtimeAudioUrl(botId: string): string {
    return `${MEETSTREAM_BASE_URL.replace('https', 'wss')}/api/v1/bots/${botId}/audio/stream`;
  }

  /**
   * Get real-time WebSocket URL for transcript streaming
   */
  static getRealtimeTranscriptUrl(botId: string): string {
    return `${MEETSTREAM_BASE_URL.replace('https', 'wss')}/api/v1/bots/${botId}/transcript/stream`;
  }

  /**
   * Check bot status
   */
  static async getBotStatus(botId: string): Promise<any> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      const response = await meetstreamApi.get(`/api/v1/bots/${botId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch status for bot ${botId}:`, error);
      throw new Error(`Failed to fetch status for bot ${botId} from Meetstream.ai`);
    }
  }

  /**
   * Get meeting analytics
   */
  static async getMeetingAnalytics(botId: string): Promise<any> {
    if (!MEETSTREAM_API_KEY) {
      throw new Error('MEETSTREAM_API_KEY is required. Please check your environment variables.');
    }

    try {
      // Note: This endpoint might not exist in the current API version
      const response = await meetstreamApi.get(`/api/v1/bots/${botId}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch analytics for bot ${botId}:`, error);
      throw new Error(`Failed to fetch analytics for bot ${botId} from Meetstream.ai`);
    }
  }

  /**
   * Health check for the API
   */
  static async healthCheck(): Promise<boolean> {
    if (!MEETSTREAM_API_KEY) {
      return false;
    }

    try {
      const response = await meetstreamApi.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Meetstream API health check failed:', error);
      return false;
    }
  }
}

// Utility functions for working with Meetstream data
export const meetstreamUtils = {
  /**
   * Extract key topics from transcript
   */
  extractTopics(transcript: string): string[] {
    // Simple keyword extraction - in production, you might want to use NLP libraries
    const commonTopics = [
      'product', 'development', 'marketing', 'sales', 'finance', 'hr', 'operations',
      'technology', 'strategy', 'planning', 'review', 'budget', 'timeline', 'goals'
    ];
    
    const words = transcript.toLowerCase().split(/\s+/);
    const topicCounts: Record<string, number> = {};
    
    commonTopics.forEach(topic => {
      const count = words.filter(word => word.includes(topic)).length;
      if (count > 0) {
        topicCounts[topic] = count;
      }
    });
    
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
  },

  /**
   * Calculate meeting duration in minutes
   */
  getDurationInMinutes(durationSeconds: number): number {
    return Math.round(durationSeconds / 60);
  },

  /**
   * Format meeting duration for display
   */
  formatDuration(durationSeconds: number): string {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Extract action items from transcript
   */
  extractActionItems(transcript: string): string[] {
    const actionPatterns = [
      /(?:need to|have to|should|must|will)\s+(.+?)(?:\.|$)/gi,
      /(?:action item|todo|task):\s*(.+?)(?:\.|$)/gi,
      /(?:assign|delegate)\s+(.+?)\s+to\s+(.+?)(?:\.|$)/gi
    ];
    
    const actionItems: string[] = [];
    
    actionPatterns.forEach(pattern => {
      const matches = transcript.match(pattern);
      if (matches) {
        actionItems.push(...matches.map(match => match.trim()));
      }
    });
    
    return [...new Set(actionItems)]; // Remove duplicates
  }
};

export default MeetstreamAPI; 