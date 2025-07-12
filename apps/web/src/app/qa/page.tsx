'use client';

import React from 'react';
import { QAChecklist } from '../../components/qa/QAChecklist';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Button } from '../../components/ui/button';
import { Download, FileText, Bug, Send } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';

// Define QAItem interface to match the expected type in QAChecklist
interface QAItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

// Define QA test cases for the CanHav MVP
const qaItems: QAItem[] = [
  // Core Functionality
  {
    id: 'core-1',
    category: 'Core Functionality',
    title: 'Asset Explorer',
    description: 'Asset list loads correctly with pagination, filtering, and search functionality',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'core-2',
    category: 'Core Functionality',
    title: 'Asset Detail Page',
    description: 'Asset details show correct metrics, charts, and risk information',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'core-3',
    category: 'Core Functionality',
    title: 'Portfolio Builder',
    description: 'Drag and drop functionality works correctly for building portfolios',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'core-4',
    category: 'Core Functionality',
    title: 'Smart Allocate',
    description: 'AI-powered allocation suggestions work based on user preferences',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'core-5',
    category: 'Core Functionality',
    title: 'Portfolio Saving & Loading',
    description: 'Portfolios can be saved, loaded, and shared correctly',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'core-6',
    category: 'Core Functionality',
    title: 'Watchlist',
    description: 'Assets can be added to and removed from watchlist',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'core-7',
    category: 'Core Functionality',
    title: 'Risk Calculation',
    description: 'Portfolio risk scores are calculated correctly based on asset allocation',
    status: 'pending',
    priority: 'high',
  },
  
  // User Authentication
  {
    id: 'auth-1',
    category: 'User Authentication',
    title: 'Sign Up',
    description: 'New users can create accounts with email verification',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'auth-2',
    category: 'User Authentication',
    title: 'Sign In',
    description: 'Existing users can sign in with correct credentials',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'auth-3',
    category: 'User Authentication',
    title: 'Password Reset',
    description: 'Users can reset their password via email',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'auth-4',
    category: 'User Authentication',
    title: 'Session Management',
    description: 'User sessions persist appropriately and can be terminated',
    status: 'pending',
    priority: 'high',
  },
  
  // Notifications
  {
    id: 'notif-1',
    category: 'Notifications',
    title: 'Notification Display',
    description: 'Notifications appear correctly in the dropdown with unread indicators',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'notif-2',
    category: 'Notifications',
    title: 'Notification Settings',
    description: 'Users can configure notification preferences',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'notif-3',
    category: 'Notifications',
    title: 'Push Notifications',
    description: 'Browser push notifications work when enabled',
    status: 'pending',
    priority: 'medium',
  },
  
  // PWA Features
  {
    id: 'pwa-1',
    category: 'PWA Features',
    title: 'Installation',
    description: 'App can be installed as a PWA on supported devices',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'pwa-2',
    category: 'PWA Features',
    title: 'Offline Access',
    description: 'Core functionality works offline with appropriate fallbacks',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'pwa-3',
    category: 'PWA Features',
    title: 'Service Worker',
    description: 'Service worker registers and updates correctly',
    status: 'pending',
    priority: 'high',
  },
  
  // Analytics
  {
    id: 'analytics-1',
    category: 'Analytics',
    title: 'Event Tracking',
    description: 'User interactions are tracked correctly in PostHog',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'analytics-2',
    category: 'Analytics',
    title: 'Consent Management',
    description: 'Users can opt in/out of analytics with preferences saved',
    status: 'pending',
    priority: 'high',
  },
  
  // Accessibility
  {
    id: 'a11y-1',
    category: 'Accessibility',
    title: 'Keyboard Navigation',
    description: 'All interactive elements can be accessed and used with keyboard',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'a11y-2',
    category: 'Accessibility',
    title: 'Screen Reader Compatibility',
    description: 'Content is properly labeled for screen readers',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'a11y-3',
    category: 'Accessibility',
    title: 'Color Contrast',
    description: 'Text has sufficient contrast against backgrounds',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'a11y-4',
    category: 'Accessibility',
    title: 'Font Sizing',
    description: 'Text remains readable when font size is increased',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'a11y-5',
    category: 'Accessibility',
    title: 'Reduced Motion',
    description: 'Animations are disabled when reduced motion is enabled',
    status: 'pending',
    priority: 'medium',
  },
  
  // Performance
  {
    id: 'perf-1',
    category: 'Performance',
    title: 'Page Load Time',
    description: 'Pages load within acceptable time limits',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'perf-2',
    category: 'Performance',
    title: 'API Response Time',
    description: 'API calls complete within acceptable time limits',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'perf-3',
    category: 'Performance',
    title: 'Memory Usage',
    description: 'Application does not cause excessive memory usage',
    status: 'pending',
    priority: 'medium',
  },
  
  // Cross-browser Compatibility
  {
    id: 'compat-1',
    category: 'Cross-browser Compatibility',
    title: 'Chrome',
    description: 'Application functions correctly in Chrome',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'compat-2',
    category: 'Cross-browser Compatibility',
    title: 'Firefox',
    description: 'Application functions correctly in Firefox',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'compat-3',
    category: 'Cross-browser Compatibility',
    title: 'Safari',
    description: 'Application functions correctly in Safari',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'compat-4',
    category: 'Cross-browser Compatibility',
    title: 'Mobile Browsers',
    description: 'Application functions correctly on mobile browsers',
    status: 'pending',
    priority: 'high',
  },
];

export default function QAPage() {
  const { user } = useAuth();
  const isAdmin = user?.email?.endsWith('@canhav.com') || false;
  
  const handleExportQA = () => {
    const savedItems = localStorage.getItem('qa-checklist-items');
    if (!savedItems) return;
    
    const items = JSON.parse(savedItems);
    const csvContent = [
      ['ID', 'Category', 'Title', 'Description', 'Status', 'Priority', 'Notes'].join(','),
      ...items.map((item: any) => [
        item.id,
        item.category,
        `"${item.title}"`,
        `"${item.description}"`,
        item.status,
        item.priority,
        `"${item.notes || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `canhav-qa-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quality Assurance</h1>
        <p className="text-muted-foreground">
          Track and verify the functionality of the CanHav MVP
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList>
          <TabsTrigger value="checklist">QA Checklist</TabsTrigger>
          <TabsTrigger value="report">Report Bug</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checklist" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExportQA} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Results
            </Button>
          </div>
          
          <QAChecklist initialItems={qaItems} readOnly={!isAdmin} />
        </TabsContent>
        
        <TabsContent value="report" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Report a Bug</CardTitle>
              <CardDescription>
                Found an issue? Submit a detailed bug report to help us improve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bug-title">Bug Title</Label>
                <input 
                  id="bug-title" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bug-description">Description</Label>
                <textarea 
                  id="bug-description" 
                  placeholder="Please provide detailed steps to reproduce the bug"
                  className="min-h-[150px] w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bug-environment">Environment</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    id="bug-browser" 
                    className="p-2 border rounded-md" 
                    placeholder="Browser & Version"
                  />
                  <input 
                    id="bug-device" 
                    className="p-2 border rounded-md" 
                    placeholder="Device & OS"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Bug Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
