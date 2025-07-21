'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  DocumentTextIcon,
  ShareIcon,
  BookmarkIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Content {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: 'ARTICLE' | 'BLOG_POST' | 'SOCIAL_MEDIA' | 'NEWSLETTER';
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW';
  createdAt: string;
  updatedAt: string;
  views: number;
  tags?: string[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
  meeting?: {
    id: string;
    title: string;
    meetingId: string;
  };
}

export default function ContentPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{[key: string]: 'idle' | 'publishing' | 'success' | 'error'}>({
    medium: 'idle',
    devto: 'idle',
    hashnode: 'idle',
    linkedin: 'idle'
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [publishData, setPublishData] = useState<any>(null);

  const publishToPlatform = async (platform: string) => {
    if (!content) return;
    
    setIsPublishing(true);
    setPublishStatus(prev => ({ ...prev, [platform]: 'publishing' }));
    
    try {
      const response = await fetch(`/api/content/${content.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      
      if (response.ok) {
        const result = await response.json();
        setPublishStatus(prev => ({ ...prev, [platform]: 'success' }));
        
        // Show modal with content for easy copying
        setPublishData(result.content);
        setSelectedPlatform(platform);
        setShowPublishModal(true);
        
        // Open the platform in a new tab
        window.open(result.url, '_blank');
      } else {
        throw new Error('Failed to publish');
      }
    } catch (error) {
      setPublishStatus(prev => ({ ...prev, [platform]: 'error' }));
      alert(`Failed to publish to ${platform}. Please try again.`);
    } finally {
      setIsPublishing(false);
    }
  };

  const getPlatformConfig = (platform: string) => {
    const configs = {
      medium: {
        name: 'Medium',
        icon: GlobeAltIcon,
        color: 'bg-green-600 hover:bg-green-700',
        description: 'Publish to Medium'
      },
      devto: {
        name: 'Dev.to',
        icon: CodeBracketIcon,
        color: 'bg-blue-600 hover:bg-blue-700',
        description: 'Publish to Dev.to'
      },
      hashnode: {
        name: 'Hashnode',
        icon: ChatBubbleLeftRightIcon,
        color: 'bg-purple-600 hover:bg-purple-700',
        description: 'Publish to Hashnode'
      },
      linkedin: {
        name: 'LinkedIn',
        icon: BuildingOfficeIcon,
        color: 'bg-sky-600 hover:bg-sky-700',
        description: 'Share on LinkedIn'
      }
    };
    return configs[platform as keyof typeof configs];
  };

  const copyToClipboard = async () => {
    if (!content) return;
    
    try {
      const textToCopy = `${content.title}\n\n${content.content}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content);
        } else {
          setError('Content not found');
        }
      } catch (error) {
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-responsive py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Content not found'}
            </h1>
            <Link href="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                content.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                content.type === 'BLOG_POST' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                content.type === 'SOCIAL_MEDIA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              }`}>
                {content.type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  copyStatus === 'copied' 
                    ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Copy content to clipboard"
              >
                {copyStatus === 'copied' ? (
                  <span className="text-sm">✓ Copied!</span>
                ) : (
                  <DocumentTextIcon className="w-5 h-5" />
                )}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <ShareIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <BookmarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="container-responsive py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Article Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                content.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                content.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {content.status}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {content.title}
            </h1>
            
            {content.summary && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {content.summary}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Published {new Date(content.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4" />
                <span>{content.views} views</span>
              </div>
              {content.user && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{content.user.name}</span>
                </div>
              )}
            </div>

            {/* Publishing Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Publish to Platforms
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['medium', 'devto', 'hashnode', 'linkedin'].map((platform) => {
                  const config = getPlatformConfig(platform);
                  const IconComponent = config.icon;
                  const status = publishStatus[platform];
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => publishToPlatform(platform)}
                      disabled={isPublishing || status === 'publishing'}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                        status === 'publishing' ? 'bg-gray-400 cursor-not-allowed' :
                        status === 'success' ? 'bg-green-600' :
                        status === 'error' ? 'bg-red-600' :
                        config.color
                      }`}
                      title={config.description}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{config.name}</span>
                      {status === 'publishing' && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {status === 'success' && (
                        <span className="text-xs">✓</span>
                      )}
                      {status === 'error' && (
                        <span className="text-xs">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Click any platform to publish your article. You'll be redirected to complete the publishing process.
              </p>
            </div>
          </div>

          {/* Article Body */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {content.content}
              </div>
            </div>
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-8">
              <div className="flex items-center gap-2 mb-4">
                <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && publishData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Publish to {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
              </h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The platform has been opened in a new tab. Copy the content below and paste it into the platform:
                </p>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={publishData.title}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(publishData.title)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={publishData.content}
                        readOnly
                        rows={15}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(publishData.content)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {publishData.tags && publishData.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={publishData.tags.join(', ')}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(publishData.tags.join(', '))}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${publishData.title}\n\n${publishData.content}`);
                    alert('All content copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Copy All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 