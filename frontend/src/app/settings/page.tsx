'use client';

import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Sun, Globe, Lock, Mail, Smartphone } from 'lucide-react';
import TalentSidebar from '@/components/TalentSidebar';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />
      
      <div className="lg:ml-64 pt-16">
        <main className="min-h-screen p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
              <p className="text-slate-500 text-sm mt-1">Manage your account preferences and privacy</p>
            </header>

            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-primary-600" />
                    <h2 className="font-bold text-slate-900">Profile Settings</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="email"
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        placeholder="your@email.com"
                      />
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all">
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-primary-600" />
                    <h2 className="font-bold text-slate-900">Notifications</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Email Notifications</p>
                        <p className="text-xs text-slate-500">Receive job updates and application status via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email ? 'bg-primary-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Push Notifications</p>
                        <p className="text-xs text-slate-500">Get instant alerts on your device</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? 'bg-primary-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-primary-600" />
                    <h2 className="font-bold text-slate-900">Privacy & Security</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-700">Change Password</p>
                        <p className="text-xs text-slate-500">Update your account password</p>
                      </div>
                    </div>
                    <span className="text-slate-400">{">"}</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-700">Data & Privacy</p>
                        <p className="text-xs text-slate-500">Manage your personal data</p>
                      </div>
                    </div>
                    <span className="text-slate-400">{">"}</span>
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    {darkMode ? <Moon className="w-5 h-5 text-primary-600" /> : <Sun className="w-5 h-5 text-primary-600" />}
                    <h2 className="font-bold text-slate-900">Appearance</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Dark Mode</p>
                      <p className="text-xs text-slate-500">Toggle dark theme for the interface</p>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-primary-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
