'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  PlayIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Bot {
  bot_id: string;
  name: string;
  meeting_url: string;
  status: 'joining' | 'connected' | 'disconnected' | 'error' | 'Active' | 'ACTIVE' | 'JOINING' | 'INACTIVE' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  created_at: string;
  updated_at: string;
  transcript_id?: string;
}

interface Content {
  id: string;
  title: string;
  type: 'ARTICLE' | 'BLOG_POST' | 'SOCIAL_MEDIA' | 'NEWSLETTER';
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW';
  createdAt: string;
  views: number;
  content: string;
  tags?: string[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bots, setBots] = useState<Bot[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [showCreateBot, setShowCreateBot] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [newBotData, setNewBotData] = useState({
    meeting_url: '',
    name: '',
    audio_required: true,
    transcription_type: 'realtime' as 'realtime' | 'post_meeting'
  });

  // Check API configuration and load data
  useEffect(() => {
    const checkConfiguration = async () => {
      // Check if we can reach our API routes (which will check server-side config)
      try {
        const response = await fetch('/api/meetstream/bots');
        setApiConfigured(true);
        
        if (response.ok) {
          await loadBots();
          await loadContents();
        }
      } catch (error) {
        console.error('API configuration check failed:', error);
        setApiConfigured(false);
      }
      
      setIsLoading(false);
    };

    checkConfiguration();
  }, []);

  const loadBots = async () => {
    try {
      const response = await fetch('/api/meetstream/bots');
      if (response.ok) {
        const botsData = await response.json();
        setBots(botsData || []); // Handle null/undefined responses
      } else {
        console.warn('API returned non-OK status, but continuing with empty bot list');
        setBots([]);
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
      // Fallback to empty array if API fails
      setBots([]);
    }
  };

  const loadContents = async () => {
    try {
      const response = await fetch('/api/content/generate');
      if (response.ok) {
        const contentsData = await response.json();
        setContents(contentsData.data || []); // Handle null/undefined responses
      } else {
        console.warn('Failed to load contents, but continuing with empty content list');
        setContents([]);
      }
    } catch (error) {
      console.error('Failed to load contents:', error);
      // Fallback to empty array if API fails
      setContents([]);
    }
  };

  const handleCreateBot = async () => {
    if (!newBotData.meeting_url || !newBotData.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await fetch('/api/meetstream/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBotData)
      });

      if (response.ok) {
        const bot = await response.json();
        setBots(prev => [...prev, bot]);
        setShowCreateBot(false);
        setNewBotData({ meeting_url: '', name: '', audio_required: true, transcription_type: 'realtime' });
        alert('Bot created successfully! It will join your meeting automatically.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to create bot';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create bot:', error);
      alert(`Failed to create bot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateContent = async (botId: string) => {
    try {
      setIsGenerating(true);
      
      // Get transcript from our API route
      const transcriptResponse = await fetch(`/api/meetstream/bots/${botId}/transcript`);
      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch transcript');
      }
      
      const transcriptData = await transcriptResponse.json();
      console.log('Transcript data:', transcriptData);
      
      // Extract transcript text - handle different response formats
      let transcriptText = '';
      if (typeof transcriptData === 'string') {
        transcriptText = transcriptData;
      } else if (transcriptData.transcript) {
        transcriptText = transcriptData.transcript;
      } else if (transcriptData.text) {
        transcriptText = transcriptData.text;
      } else if (transcriptData.content) {
        transcriptText = transcriptData.content;
      } else {
        // If it's an object, try to stringify it
        transcriptText = JSON.stringify(transcriptData);
      }
      
      if (!transcriptText || transcriptText.trim().length === 0) {
        throw new Error('No transcript content found');
      }
      
      console.log('Using transcript text:', transcriptText.substring(0, 200) + '...');
      
      // Generate content using OpenAI
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          type: 'ARTICLE',
          tone: 'professional',
          length: 'medium',
          botId: botId
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Content generated successfully! Check the Content tab.');
        // Refresh content list
        await loadContents();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to generate content';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveBot = async (botId: string) => {
    if (confirm('Are you sure you want to remove this bot from the meeting?')) {
      try {
        const response = await fetch(`/api/meetstream/bots/${botId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setBots(prev => prev.filter(bot => bot.bot_id !== botId));
          alert('Bot removed successfully');
        } else {
          throw new Error('Failed to remove bot');
        }
      } catch (error) {
        console.error('Failed to remove bot:', error);
        alert('Failed to remove bot. Please try again.');
      }
    }
  };

  const stats = {
    totalMeetings: bots.length,
    totalContent: contents.length,
    publishedContent: contents.filter(c => c.status === 'PUBLISHED').length,
    totalViews: contents.reduce((sum, c) => sum + c.views, 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show configuration error if API is not configured
  if (!apiConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container-responsive py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  <ArrowLeftIcon className="w-5 h-5" />
                  Back to Home
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Content Rebirth Dashboard
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container-responsive py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Configuration Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your Meetstream.ai API key is not configured. Please set up your environment variables to use the dashboard.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Required Environment Variables:</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
                 
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Reload After Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Content Rebirth Dashboard
              </h1>
            </div>
            <button
              onClick={() => setShowCreateBot(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Meeting Bot
            </button>
          </div>
        </div>
      </header>

      <div className="container-responsive py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <VideoCameraIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Bots</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMeetings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CogIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Generated Content</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalContent}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedContent}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Create Bot Modal */}
        {showCreateBot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Meeting Bot</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting URL</label>
                  <input
                    type="url"
                    value={newBotData.meeting_url}
                    onChange={(e) => setNewBotData(prev => ({ ...prev, meeting_url: e.target.value }))}
                    placeholder="https://zoom.us/j/123456789"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bot Name</label>
                  <input
                    type="text"
                    value={newBotData.name}
                    onChange={(e) => setNewBotData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Content Bot"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transcription Type</label>
                  <select
                    value={newBotData.transcription_type}
                    onChange={(e) => setNewBotData(prev => ({ ...prev, transcription_type: e.target.value as 'realtime' | 'post_meeting' }))}
                    className="form-select"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="post_meeting">Post-meeting</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCreateBot(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBot}
                  disabled={isGenerating}
                  className="btn-primary flex-1"
                >
                  {isGenerating ? 'Creating...' : 'Create Bot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'meetings', label: 'Meeting Bots' },
                { id: 'content', label: 'Content' },
                { id: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                {bots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No meeting bots created yet.</p>
                    <button
                      onClick={() => setShowCreateBot(true)}
                      className="btn-primary mt-4"
                    >
                      Create Your First Bot
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bots.slice(0, 3).map((bot) => (
                      <div key={bot.bot_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{bot.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(bot.created_at).toLocaleDateString()} • {bot.status}
                          </p>
                        </div>
                        <span className={`status-indicator ${
                          bot.status === 'ACTIVE' || bot.status === 'connected' ? 'status-completed' : 
                          bot.status === 'JOINING' || bot.status === 'joining' ? 'status-processing' : 'status-failed'
                        }`}>
                          {bot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Bots</h3>
                  <button onClick={() => setShowCreateBot(true)} className="btn-primary">Create New Bot</button>
                </div>
                {bots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No meeting bots found.</p>
                    <button
                      onClick={() => setShowCreateBot(true)}
                      className="btn-primary mt-4"
                    >
                      Create Your First Bot
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bots.map((bot) => (
                      <div key={bot.bot_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{bot.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {bot.meeting_url} • {new Date(bot.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`status-indicator ${
                            bot.status === 'ACTIVE' || bot.status === 'connected' ? 'status-completed' : 
                            bot.status === 'JOINING' || bot.status === 'joining' ? 'status-processing' : 'status-failed'
                          }`}>
                            {bot.status}
                          </span>
                          <button 
                            onClick={() => handleGenerateContent(bot.bot_id)}
                            disabled={isGenerating || (bot.status !== 'connected' && bot.status !== 'ACTIVE')}
                            className="btn-secondary"
                          >
                            Generate Content
                          </button>
                          <button 
                            onClick={() => handleRemoveBot(bot.bot_id)}
                            className="btn-danger"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Content</h3>
                {contents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No content generated yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Create a meeting bot and generate content from transcripts.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contents.map((content) => (
                      <div key={content.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                content.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                content.type === 'BLOG_POST' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                content.type === 'SOCIAL_MEDIA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              }`}>
                                {content.type.replace('_', ' ')}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                content.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                content.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {content.status}
                              </span>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {content.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                              {content.content.substring(0, 200)}...
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Created: {new Date(content.createdAt).toLocaleDateString()}</span>
                              <span>Views: {content.views}</span>
                              {content.tags && content.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {content.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                  {content.tags.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                      +{content.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Link
                              href={`/content/${content.id}`}
                              className="btn-primary flex items-center gap-2"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View
                            </Link>
                            <button 
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/content/${content.id}/publish`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ platform: 'medium' })
                                  });
                                  if (response.ok) {
                                    const result = await response.json();
                                    if (result.url) {
                                      window.open(result.url, '_blank');
                                    }
                                  }
                                } catch (error) {
                                  console.error('Failed to publish:', error);
                                }
                              }}
                              className="btn-success flex items-center gap-2"
                              title="Quick publish to Medium"
                            >
                              <GlobeAltIcon className="w-4 h-4" />
                              Publish
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-400 hover:text-red-600">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Bot Status</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        bots.reduce((acc, bot) => {
                          acc[bot.status] = (acc[bot.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([status, count]) => (
                        <div key={status} className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Content Types</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        contents.reduce((acc, content) => {
                          acc[content.type] = (acc[content.type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 