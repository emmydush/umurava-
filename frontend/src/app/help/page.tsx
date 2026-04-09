'use client';

import React, { useState } from 'react';
import { Search, HelpCircle, Mail, MessageCircle, Phone, Book, FileText, Video, ChevronDown, ChevronRight } from 'lucide-react';
import TalentSidebar from '@/components/TalentSidebar';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Book className="w-4 h-4" />,
      questions: [
        {
          q: 'How do I create my talent profile?',
          a: 'Navigate to "My Profile" from the dropdown menu and fill in your personal information, skills, and work experience. Upload your resume to get started with job matching.'
        },
        {
          q: 'What information should I include in my profile?',
          a: 'Include your work experience, education, skills, and a professional summary. The more complete your profile, the better job matches you\'ll receive.'
        },
        {
          q: 'How do I upload my resume?',
          a: 'Click "Update Resume" from the profile menu and upload your PDF or Word document. Our AI will analyze it to extract your skills and experience.'
        }
      ]
    },
    {
      id: 'jobs-applications',
      title: 'Jobs & Applications',
      icon: <FileText className="w-4 h-4" />,
      questions: [
        {
          q: 'How do I search for jobs?',
          a: 'Use the search bar on the Jobs page to filter by title, company, or skills. You can also browse recommended jobs on your dashboard.'
        },
        {
          q: 'How do I apply for a job?',
          a: 'Click on any job listing to view details, then click "Apply Now". Make sure your profile is complete before applying.'
        },
        {
          q: 'How can I track my application status?',
          a: 'View all your applications from the dashboard. You\'ll see real-time updates as your application progresses through screening stages.'
        },
        {
          q: 'What do the application statuses mean?',
          a: 'Pending: Under review, Screening: AI analysis in progress, Under Review: Being evaluated by recruiters, Accepted: You\'ve been selected!'
        }
      ]
    },
    {
      id: 'screening-interviews',
      title: 'Screening & Interviews',
      icon: <Video className="w-4 h-4" />,
      questions: [
        {
          q: 'What is AI screening?',
          a: 'Our AI analyzes your profile against job requirements to determine compatibility. This helps match you with the most suitable positions.'
        },
        {
          q: 'How are screening scores calculated?',
          a: 'Scores are based on skills match, experience relevance, and education. Higher scores indicate better alignment with job requirements.'
        },
        {
          q: 'What happens after screening?',
          a: 'If you pass screening, your application is sent to recruiters. They may contact you for additional interviews or assessments.'
        }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      icon: <HelpCircle className="w-4 h-4" />,
      questions: [
        {
          q: 'How do I change my password?',
          a: 'Go to Settings > Privacy & Security > Change Password. You\'ll receive an email to confirm the change.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, contact support through the help form below to request account deletion. We\'ll process your request within 24 hours.'
        },
        {
          q: 'How do I update my notification preferences?',
          a: 'Navigate to Settings and adjust your email, push, and SMS notification preferences.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />
      
      <div className="lg:ml-64 pt-16">
        <main className="min-h-screen p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Help & Support</h1>
              <p className="text-slate-500 text-sm mt-1">Find answers to common questions and get assistance</p>
            </header>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all group">
                <MessageCircle className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-900 text-sm">Live Chat</h3>
                <p className="text-xs text-slate-500 mt-1">Chat with our support team</p>
              </button>
              
              <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all group">
                <Mail className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-900 text-sm">Email Support</h3>
                <p className="text-xs text-slate-500 mt-1">Get help via email</p>
              </button>
              
              <button className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all group">
                <Phone className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-900 text-sm">Call Us</h3>
                <p className="text-xs text-slate-500 mt-1">Mon-Fri 9AM-6PM EST</p>
              </button>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                        {category.icon}
                      </div>
                      <h2 className="font-bold text-slate-900">{category.title}</h2>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {category.questions.length} articles
                      </span>
                    </div>
                    {expandedCategory === category.id ? 
                      <ChevronDown className="w-5 h-5 text-slate-400" /> : 
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    }
                  </button>
                  
                  {expandedCategory === category.id && (
                    <div className="border-t border-slate-100">
                      {category.questions.map((question, index) => (
                        <div key={index} className="p-6 border-b border-slate-50 last:border-b-0">
                          <h3 className="font-medium text-slate-900 mb-2">{question.q}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{question.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Still need help?</h2>
                <p className="text-sm text-slate-500 mt-1">Send us a message and we'll get back to you</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                  <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
