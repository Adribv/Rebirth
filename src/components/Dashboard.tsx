'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  PlayIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Meeting {
  id: string;
  title: string;
  duration: number;
  participants: string[];
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface Content {
  id: string;
  title: string;
  type: 'ARTICLE' | 'BLOG_POST' | 'SOCIAL_MEDIA' | 'NEWSLETTER';
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW';
  createdAt: string;
  views: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - in real app, this would come from API
  const meetings: Meeting[] = [
    {
      id: '1',
      title: 'Product Strategy Meeting',
      duration: 3600,
      participants: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      status: 'completed',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Marketing Campaign Review',
      duration: 1800,
      participants: ['Sarah Wilson', 'Tom Brown'],
      status: 'processing',
      createdAt: '2024-01-14T14:30:00Z'
    }
  ];

  const contents: Content[] = [
    {
      id: '1',
      title: '5 Key Insights from Our Product Strategy Meeting',
      type: 'ARTICLE',
      status: 'PUBLISHED',
      createdAt: '2024-01-15T12:00:00Z',
      views: 1250
    },
    {
      id: '2',
      title: 'Marketing Campaign Success Metrics',
      type: 'BLOG_POST',
      status: 'DRAFT',
      createdAt: '2024-01-14T16:00:00Z',
      views: 0
    }
  ];

  const stats = {
    totalMeetings: meetings.length,
    totalContent: contents.length,
    publishedContent: contents.filter(c => c.status === 'PUBLISHED').length,
    totalViews: contents.reduce((sum, c) => sum + c.views, 0)
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // In real app, this would call the content generation API
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Content Rebirth Dashboard
            </h1>
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Generate Content
                </>
              )}
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
                <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meetings</p>
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

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'meetings', label: 'Meetings' },
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
                <div className="space-y-4">
                  {contents.slice(0, 3).map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{content.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(content.createdAt).toLocaleDateString()} • {content.views} views
                        </p>
                      </div>
                      <span className={`badge ${content.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                        {content.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Meetings</h3>
                  <button className="btn-primary">Import from Meetstream.ai</button>
                </div>
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {meeting.participants.length} participants • {Math.round(meeting.duration / 60)} minutes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`status-indicator ${
                          meeting.status === 'completed' ? 'status-completed' : 
                          meeting.status === 'processing' ? 'status-processing' : 'status-failed'
                        }`}>
                          {meeting.status}
                        </span>
                        <button className="btn-secondary">Generate Content</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Content</h3>
                <div className="space-y-4">
                  {contents.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{content.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {content.type} • {new Date(content.createdAt).toLocaleDateString()} • {content.views} views
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${content.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                          {content.status}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Content Views</h4>
                    <div className="space-y-2">
                      {contents.map((content) => (
                        <div key={content.id} className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{content.title}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{content.views}</span>
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