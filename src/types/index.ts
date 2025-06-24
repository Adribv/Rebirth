// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Meetstream.ai Types
export interface MeetstreamTranscript {
  id: string;
  meeting_id: string;
  transcript: string;
  duration: number;
  participants: string[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface MeetstreamMeeting {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'ended' | 'processing';
  created_at: string;
  updated_at: string;
}

// Content Generation Types
export interface ContentGenerationRequest {
  transcript: string;
  type: ContentType;
  title?: string;
  category?: string;
  tags?: string[];
  tone?: 'professional' | 'casual' | 'academic' | 'conversational';
  length?: 'short' | 'medium' | 'long';
}

export interface GeneratedContent {
  title: string;
  content: string;
  summary: string;
  seoData: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  tags: string[];
  category: string;
}

// Database Types (matching Prisma schema)
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
export type MeetingStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ContentType = 'ARTICLE' | 'BLOG_POST' | 'SOCIAL_MEDIA' | 'NEWSLETTER' | 'WHITEPAPER' | 'CASE_STUDY';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type AnalyticsType = 'CONTENT_VIEW' | 'CONTENT_ENGAGEMENT' | 'GENERATION_SUCCESS' | 'POPULAR_TOPICS' | 'REAL_TIME_STATS';
export type JobType = 'TRANSCRIPT_PROCESSING' | 'CONTENT_GENERATION' | 'SEO_OPTIMIZATION' | 'CONTENT_CATEGORIZATION';
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Meeting Types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingId: string;
  transcript: string;
  duration: number;
  participants: string[];
  status: MeetingStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  meetingId: string;
  transcript: string;
  duration: number;
  participants: string[];
  metadata?: Record<string, any>;
}

// Content Types
export interface Content {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: ContentType;
  category?: string;
  tags: string[];
  seoData?: Record<string, any>;
  status: ContentStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  meetingId?: string;
}

export interface CreateContentRequest {
  title: string;
  content: string;
  summary?: string;
  type: ContentType;
  category?: string;
  tags?: string[];
  seoData?: Record<string, any>;
  meetingId?: string;
}

export interface UpdateContentRequest {
  title?: string;
  content?: string;
  summary?: string;
  type?: ContentType;
  category?: string;
  tags?: string[];
  seoData?: Record<string, any>;
  status?: ContentStatus;
}

// Analytics Types
export interface Analytics {
  id: string;
  type: AnalyticsType;
  data: Record<string, any>;
  createdAt: Date;
  userId: string;
  contentId?: string;
}

export interface AnalyticsData {
  contentViews: number;
  engagementRate: number;
  generationSuccess: number;
  popularTopics: Array<{ topic: string; count: number }>;
  realTimeStats: {
    activeUsers: number;
    processingJobs: number;
    generatedContent: number;
  };
}

// Processing Job Types
export interface ProcessingJob {
  id: string;
  type: JobType;
  status: JobStatus;
  data: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Types
export interface DashboardStats {
  totalMeetings: number;
  totalContent: number;
  publishedContent: number;
  totalViews: number;
  averageEngagement: number;
  recentActivity: Array<{
    id: string;
    type: 'meeting' | 'content' | 'analytics';
    title: string;
    timestamp: Date;
  }>;
}

// Form Types
export interface ContentGenerationForm {
  transcript: string;
  type: ContentType;
  title?: string;
  category?: string;
  tags: string[];
  tone: 'professional' | 'casual' | 'academic' | 'conversational';
  length: 'short' | 'medium' | 'long';
}

// Real-time Types
export interface RealTimeUpdate {
  type: 'transcript_update' | 'content_generated' | 'analytics_update';
  data: any;
  timestamp: Date;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
} 