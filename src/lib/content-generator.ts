import OpenAI from 'openai';
import { ContentGenerationRequest, GeneratedContent, ContentType } from '@/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export class ContentGenerator {
  /**
   * Generate content from meeting transcript
   */
  static async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      const prompt = this.buildPrompt(request);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert content creator who transforms meeting transcripts into engaging, well-structured content. You understand the context and can create various types of content while maintaining the original meaning and insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: this.getMaxTokens(request.length || 'medium'),
      });

      const generatedText = completion.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error('No content generated');
      }

      // Parse the generated content
      const parsedContent = this.parseGeneratedContent(generatedText, request);
      
      return parsedContent;
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error('Failed to generate content');
    }
  }

  /**
   * Build the prompt for content generation
   */
  private static buildPrompt(request: ContentGenerationRequest): string {
    const { transcript, type, title, category, tags, tone, length } = request;
    
    const contentTypeInstructions = this.getContentTypeInstructions(type);
    const toneInstructions = this.getToneInstructions((tone || 'professional') as 'professional' | 'casual' | 'academic' | 'conversational');
    const lengthInstructions = this.getLengthInstructions((length || 'medium') as 'short' | 'medium' | 'long');
    
    return `
Please transform the following meeting transcript into ${type.toLowerCase()} content.

${contentTypeInstructions}

${toneInstructions}

${lengthInstructions}

${title ? `Title: ${title}` : ''}
${category ? `Category: ${category}` : ''}
${tags && tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}

Meeting Transcript:
${transcript}

Please generate the content in the following JSON format:
{
  "title": "Engaging title for the content",
  "content": "The main content body",
  "summary": "A brief summary of the key points",
  "seoData": {
    "metaTitle": "SEO-optimized title (50-60 characters)",
    "metaDescription": "SEO-optimized description (150-160 characters)",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  },
  "tags": ["tag1", "tag2", "tag3"],
  "category": "content category"
}

Focus on:
- Extracting key insights and actionable points
- Maintaining the original context and meaning
- Creating engaging, readable content
- Optimizing for the specified content type and tone
- Including relevant keywords naturally
    `;
  }

  /**
   * Get content type specific instructions
   */
  private static getContentTypeInstructions(type: ContentType): string {
    switch (type) {
      case 'ARTICLE':
        return 'Create a comprehensive article with clear sections, headings, and a logical flow. Include an introduction, main points, and conclusion.';
      case 'BLOG_POST':
        return 'Create an engaging blog post with a conversational tone, clear headings, and actionable insights. Make it shareable and easy to read.';
      case 'SOCIAL_MEDIA':
        return 'Create multiple social media posts (Twitter, LinkedIn, Instagram) with engaging hooks, hashtags, and call-to-actions. Keep each post concise and impactful.';
      case 'NEWSLETTER':
        return 'Create a newsletter format with a compelling subject line, introduction, key highlights, and a call-to-action. Make it scannable and informative.';
      case 'WHITEPAPER':
        return 'Create a professional whitepaper with executive summary, detailed analysis, data insights, and recommendations. Use formal language and structure.';
      case 'CASE_STUDY':
        return 'Create a case study with problem statement, solution approach, implementation details, results, and key learnings. Include metrics and outcomes.';
      default:
        return 'Create engaging content that captures the key points from the meeting.';
    }
  }

  /**
   * Get tone instructions
   */
  private static getToneInstructions(tone: 'professional' | 'casual' | 'academic' | 'conversational'): string {
    switch (tone) {
      case 'professional':
        return 'Use formal, business-appropriate language with industry terminology. Maintain a professional and authoritative tone.';
      case 'casual':
        return 'Use conversational, friendly language. Write as if speaking to a colleague. Include relatable examples and informal expressions.';
      case 'academic':
        return 'Use scholarly language with proper citations and references. Maintain an analytical and research-based approach.';
      case 'conversational':
        return 'Use natural, flowing language that feels like a friendly conversation. Include questions and engaging elements.';
      default:
        return 'Use clear, professional language that is appropriate for the content type.';
    }
  }

  /**
   * Get length instructions
   */
  private static getLengthInstructions(length: 'short' | 'medium' | 'long'): string {
    switch (length) {
      case 'short':
        return 'Keep the content concise and focused. Aim for 300-500 words.';
      case 'medium':
        return 'Create comprehensive content with good detail. Aim for 800-1200 words.';
      case 'long':
        return 'Create detailed, in-depth content with extensive coverage. Aim for 1500-2500 words.';
      default:
        return 'Create content of appropriate length for the content type.';
    }
  }

  /**
   * Get maximum tokens based on content length
   */
  private static getMaxTokens(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 1000;
      case 'medium':
        return 2000;
      case 'long':
        return 4000;
      default:
        return 2000;
    }
  }

  /**
   * Parse the generated content from OpenAI response
   */
  private static parseGeneratedContent(generatedText: string, request: ContentGenerationRequest): GeneratedContent {
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || request.title || 'Generated Content',
          content: parsed.content || generatedText,
          summary: parsed.summary || this.generateSummary(generatedText),
          seoData: parsed.seoData || this.generateSEOData(parsed.title || request.title || 'Generated Content'),
          tags: parsed.tags || request.tags || [],
          category: parsed.category || request.category || 'General'
        };
      }

      // Fallback: parse the text manually
      return {
        title: request.title || 'Generated Content',
        content: generatedText,
        summary: this.generateSummary(generatedText),
        seoData: this.generateSEOData(request.title || 'Generated Content'),
        tags: request.tags || [],
        category: request.category || 'General'
      };
    } catch (error) {
      console.error('Failed to parse generated content:', error);
      // Return a basic structure if parsing fails
      return {
        title: request.title || 'Generated Content',
        content: generatedText,
        summary: this.generateSummary(generatedText),
        seoData: this.generateSEOData(request.title || 'Generated Content'),
        tags: request.tags || [],
        category: request.category || 'General'
      };
    }
  }

  /**
   * Generate a summary from content
   */
  private static generateSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summarySentences = sentences.slice(0, 2);
    return summarySentences.join('. ') + '.';
  }

  /**
   * Generate SEO data
   */
  private static generateSEOData(title: string): { metaTitle: string; metaDescription: string; keywords: string[] } {
    return {
      metaTitle: title.length > 60 ? title.substring(0, 57) + '...' : title,
      metaDescription: `Discover insights and key takeaways from this comprehensive discussion. Learn more about ${title.toLowerCase()}.`,
      keywords: ['meeting insights', 'business discussion', 'key takeaways', title.toLowerCase()]
    };
  }

  /**
   * Generate multiple content variations
   */
  static async generateContentVariations(
    transcript: string,
    variations: Array<{ type: ContentType; tone: string; length: string }>
  ): Promise<GeneratedContent[]> {
    const promises = variations.map(variation => 
      this.generateContent({
        transcript,
        type: variation.type,
        tone: variation.tone,
        length: variation.length
      })
    );

    return Promise.all(promises);
  }

  /**
   * Generate content outline from transcript
   */
  static async generateOutline(transcript: string, type: ContentType): Promise<string[]> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert content strategist who creates outlines for various content types."
          },
          {
            role: "user",
            content: `Create a detailed outline for a ${type.toLowerCase()} based on this meeting transcript. Return only the outline points as a JSON array of strings:

${transcript}`
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No outline generated');
      }

      try {
        const outline = JSON.parse(response);
        return Array.isArray(outline) ? outline : [];
      } catch {
        // Fallback: split by lines and clean up
        return response.split('\n')
          .map(line => line.replace(/^[-*•\d\.\s]+/, '').trim())
          .filter(line => line.length > 0);
      }
    } catch (error) {
      console.error('Outline generation failed:', error);
      return [];
    }
  }

  /**
   * Extract key insights from transcript
   */
  static async extractInsights(transcript: string): Promise<string[]> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert analyst who extracts key insights and actionable points from meeting transcripts."
          },
          {
            role: "user",
            content: `Extract the top 5-7 key insights and actionable points from this meeting transcript. Return as a JSON array of strings:

${transcript}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No insights generated');
      }

      try {
        const insights = JSON.parse(response);
        return Array.isArray(insights) ? insights : [];
      } catch {
        // Fallback: split by lines and clean up
        return response.split('\n')
          .map(line => line.replace(/^[-*•\d\.\s]+/, '').trim())
          .filter(line => line.length > 0);
      }
    } catch (error) {
      console.error('Insight extraction failed:', error);
      return [];
    }
  }
}

export default ContentGenerator; 