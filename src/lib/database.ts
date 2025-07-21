import { prisma } from './prisma';

export interface CreateBotData {
  botId: string;
  name: string;
  meetingUrl: string;
  status: string;
  transcriptId?: string;
  transcriptionType: 'REALTIME' | 'POST_MEETING';
  userId: string;
}

export interface UpdateBotData {
  status?: string;
  transcriptId?: string;
  metadata?: any;
}

// Function to map API status to database enum
function mapStatusToEnum(apiStatus: string): 'JOINING' | 'ACTIVE' | 'INACTIVE' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' {
  switch (apiStatus.toLowerCase()) {
    case 'active':
    case 'connected':
      return 'ACTIVE';
    case 'joining':
      return 'JOINING';
    case 'inactive':
    case 'disconnected':
      return 'INACTIVE';
    case 'error':
      return 'ERROR';
    default:
      return 'JOINING';
  }
}

export class DatabaseService {
  /**
   * Create a new bot in the database
   */
  static async createBot(data: CreateBotData) {
    try {
      const bot = await prisma.bot.create({
        data: {
          botId: data.botId,
          name: data.name,
          meetingUrl: data.meetingUrl,
          status: mapStatusToEnum(data.status),
          transcriptId: data.transcriptId,
          transcriptionType: data.transcriptionType,
          userId: data.userId,
          metadata: {}
        }
      });
      return bot;
    } catch (error) {
      console.error('Failed to create bot in database:', error);
      throw error;
    }
  }

  /**
   * Get all bots for a user
   */
  static async getBotsByUserId(userId: string) {
    try {
      const bots = await prisma.bot.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return bots;
    } catch (error) {
      console.error('Failed to get bots from database:', error);
      throw error;
    }
  }

  /**
   * Get a bot by its Meetstream bot ID
   */
  static async getBotByBotId(botId: string) {
    try {
      const bot = await prisma.bot.findUnique({
        where: { botId }
      });
      return bot;
    } catch (error) {
      console.error('Failed to get bot from database:', error);
      throw error;
    }
  }

  /**
   * Update a bot's status and metadata
   */
  static async updateBot(botId: string, data: UpdateBotData) {
    try {
      const bot = await prisma.bot.update({
        where: { botId },
        data: {
          status: data.status ? mapStatusToEnum(data.status) : undefined,
          transcriptId: data.transcriptId,
          metadata: data.metadata,
          updatedAt: new Date()
        }
      });
      return bot;
    } catch (error) {
      console.error('Failed to update bot in database:', error);
      throw error;
    }
  }

  /**
   * Delete a bot from the database
   */
  static async deleteBot(botId: string) {
    try {
      await prisma.bot.delete({
        where: { botId }
      });
      return true;
    } catch (error) {
      console.error('Failed to delete bot from database:', error);
      throw error;
    }
  }

  /**
   * Get bot statistics for a user
   */
  static async getBotStats(userId: string) {
    try {
      const stats = await prisma.bot.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true
        }
      });
      return stats;
    } catch (error) {
      console.error('Failed to get bot stats from database:', error);
      throw error;
    }
  }
}

export default DatabaseService; 