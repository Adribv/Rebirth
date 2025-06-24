'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Meeting Transcript Processing',
      description: 'Automatically process and analyze meeting transcripts using Meetstream.ai API',
      color: 'bg-blue-500'
    },
    {
      icon: CogIcon,
      title: 'AI Content Generation',
      description: 'Transform meeting discussions into engaging articles, blog posts, and social media content',
      color: 'bg-green-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Track content performance, engagement metrics, and generation success rates',
      color: 'bg-purple-500'
    },
    {
      icon: PlayIcon,
      title: 'Real-time Processing',
      description: 'Live meeting transcript processing with WebSocket support for instant content creation',
      color: 'bg-orange-500'
    }
  ];

  const benefits = [
    'Prevents content creator burnout by automating content generation',
    'Creates fresh, engaging content from existing meeting discussions',
    'Maintains content quality and relevance through AI analysis',
    'Provides sustainable content ecosystem for the internet',
    'Tracks performance and engagement metrics',
    'Supports multiple content formats and distribution channels'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container-responsive py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Content Rebirth</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Preventing the dead internet by transforming meeting transcripts into 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> fresh, engaging content</span>
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              The theory suggests that reduced website traffic and ad revenue will demotivate content creators, 
              leading to a decline in new content creation. We solve this by creating sustainable content generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Get Started
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-powered platform transforms meeting discussions into engaging content, 
              helping to maintain a vibrant internet ecosystem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg card-hover"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Content Rebirth?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our solution addresses the core challenges of content creation in the AI era.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-semibold mb-6 text-red-600 dark:text-red-400">
                The Problem: Dead Internet Theory
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Reduced website traffic and ad revenue demotivate content creators</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Decline in new organic content creation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>AI models lack fresh data for training</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Potential "dead internet" with no new content</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-semibold mb-6 text-green-600 dark:text-green-400">
                Our Solution: Content Rebirth
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Prevent the Dead Internet?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join us in creating a sustainable content ecosystem powered by AI and meeting insights.
            </p>
            <Link href="/dashboard" className="bg-white text-blue-600 font-semibold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors duration-200 inline-block">
              Start Generating Content
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-responsive">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Content Rebirth</h3>
            <p className="text-gray-400 mb-6">
              Preventing the dead internet, one meeting at a time.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Content Rebirth</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 