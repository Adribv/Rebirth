import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { ContentGenerationRequest, ApiResponse } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required but was not provided in the environment');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { transcript, type, tone, length, botId } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // For now, use a default user ID since authentication isn't implemented yet
    // In a real app, you'd get this from the authenticated user session
    const defaultUserId = '507f1f77bcf86cd799439011'; // Default MongoDB ObjectId

    // Check if default user exists, create if not
    let user = await prisma.user.findUnique({
      where: { id: defaultUserId }
    });

    if (!user) {
      // Create default user
      user = await prisma.user.create({
        data: {
          id: defaultUserId,
          email: 'default@contentrebirth.com',
          name: 'Default User',
          password: 'default-password-hash', // In production, this should be properly hashed
          role: 'USER'
        }
      });
    }

    // Determine content type and generate appropriate prompt
    const contentConfig = getContentConfig(type, tone, length);
    
    const prompt = `
You are a professional content creator. Create engaging content based on the following meeting transcript.

TRANSCRIPT:
${transcript}

REQUIREMENTS:
- Content Type: ${contentConfig.type}
- Tone: ${contentConfig.tone}
- Length: ${contentConfig.length}
- Style: ${contentConfig.style}
- Target Audience: ${contentConfig.audience}

INSTRUCTIONS:
${contentConfig.instructions}

Please create the content in the following format:
TITLE: [Engaging title]
CONTENT: [Main content]
KEY_TAKEAWAYS: [3-5 key points from the content]
TAGS: [Relevant tags separated by commas]

Make sure the content is:
- Engaging and informative
- Based on the actual transcript content
- Professional yet accessible
- Optimized for the specified content type
- Includes actionable insights when possible
`;

    // Use Gemini Flash model (more widely available)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedContent = response.text();
      
      if (!generatedContent) {
        throw new Error('No content generated from Gemini API');
      }
      
      // Parse the generated content
      const parsedContent = parseGeneratedContent(generatedContent);

      // Save to database
      const savedContent = await prisma.content.create({
        data: {
          title: parsedContent.title,
          content: parsedContent.content,
          type: type,
          status: 'DRAFT',
          userId: user.id, // Use the actual user ID
          tags: parsedContent.tags,
          views: 0,
        },
      });

      return NextResponse.json({
        success: true,
        content: savedContent,
        message: 'Content generated successfully!'
      });
      
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      throw new Error(`Gemini API error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getContentConfig(type: string, tone: string, length: string) {
  const configs = {
    ARTICLE: {
      type: 'Professional Article',
      tone: tone === 'professional' ? 'Professional and authoritative' : 'Conversational and engaging',
      length: length === 'short' ? '500-800 words' : length === 'medium' ? '1000-1500 words' : '2000+ words',
      style: 'In-depth analysis with clear structure',
      audience: 'Industry professionals and decision-makers',
      instructions: 'Create a comprehensive article that provides valuable insights, includes data points when mentioned, and offers actionable takeaways. Use subheadings to organize content.',
      maxTokens: length === 'short' ? 1000 : length === 'medium' ? 2000 : 3000
    },
    BLOG_POST: {
      type: 'Blog Post',
      tone: tone === 'professional' ? 'Professional yet approachable' : 'Casual and conversational',
      length: length === 'short' ? '400-600 words' : length === 'medium' ? '800-1200 words' : '1500+ words',
      style: 'Engaging and shareable content',
      audience: 'General audience interested in the topic',
      instructions: 'Write an engaging blog post that tells a story, includes personal insights, and encourages reader interaction. Use bullet points and short paragraphs.',
      maxTokens: length === 'short' ? 800 : length === 'medium' ? 1500 : 2500
    },
    SOCIAL_MEDIA: {
      type: 'Social Media Content',
      tone: 'Engaging and conversational',
      length: 'Short and impactful',
      style: 'Attention-grabbing and shareable',
      audience: 'Social media users',
      instructions: 'Create multiple social media posts (Twitter, LinkedIn, Instagram) with hashtags and engaging hooks. Keep it concise and memorable.',
      maxTokens: 500
    },
    NEWSLETTER: {
      type: 'Newsletter Content',
      tone: tone === 'professional' ? 'Professional and informative' : 'Friendly and engaging',
      length: length === 'short' ? '300-500 words' : length === 'medium' ? '600-900 words' : '1000+ words',
      style: 'Newsletter format with clear sections',
      audience: 'Subscribers and stakeholders',
      instructions: 'Create newsletter content with a compelling subject line, clear sections, and call-to-action. Include a summary and key highlights.',
      maxTokens: length === 'short' ? 600 : length === 'medium' ? 1200 : 2000
    }
  };

  return configs[type as keyof typeof configs] || configs.ARTICLE;
}

function parseGeneratedContent(content: string) {
  const lines = content.split('\n');
  let title = '';
  let mainContent = '';
  let keyTakeaways: string[] = [];
  let tags: string[] = [];

  let currentSection = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('TITLE:')) {
      title = trimmedLine.replace('TITLE:', '').trim();
    } else if (trimmedLine.startsWith('CONTENT:')) {
      currentSection = 'content';
    } else if (trimmedLine.startsWith('KEY_TAKEAWAYS:')) {
      currentSection = 'takeaways';
    } else if (trimmedLine.startsWith('TAGS:')) {
      currentSection = 'tags';
    } else if (trimmedLine && currentSection === 'content') {
      mainContent += trimmedLine + '\n';
    } else if (trimmedLine && currentSection === 'takeaways') {
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        keyTakeaways.push(trimmedLine.substring(1).trim());
      } else {
        keyTakeaways.push(trimmedLine);
      }
    } else if (trimmedLine && currentSection === 'tags') {
      const tagString = trimmedLine.replace('TAGS:', '').trim();
      tags = tagString.split(',').map(tag => tag.trim());
    }
  }

  // Fallback parsing if structured format fails
  if (!title) {
    const firstLine = lines.find(line => line.trim() && !line.trim().startsWith('TITLE:') && !line.trim().startsWith('CONTENT:'));
    title = firstLine?.trim() || 'Generated Content';
  }

  if (!mainContent) {
    mainContent = content;
  }

  return {
    title,
    content: mainContent.trim(),
    keyTakeaways: keyTakeaways.filter(takeaway => takeaway.length > 0),
    tags: tags.filter(tag => tag.length > 0)
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        type: true,
        category: true,
        tags: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        views: true,
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: contents
    });

  } catch (error) {
    console.error('Failed to fetch contents:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch contents'
    }, { status: 500 });
  }
} 