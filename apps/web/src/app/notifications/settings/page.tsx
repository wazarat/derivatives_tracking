'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bell, Loader2, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { Switch } from '../../../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../components/ui/use-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  NotificationPreferences,
  defaultNotificationPreferences,
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermission
} from '../../../services/notificationService';

// Form schema
const notificationFormSchema = z.object({
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  emailFrequency: z.enum(['immediate', 'daily', 'weekly']),
  notifyOnPortfolioUpdates: z.boolean(),
  notifyOnMarketAlerts: z.boolean(),
  notifyOnRiskWarnings: z.boolean(),
  notifyOnYieldOpportunities: z.boolean(),
  notifyOnSystemUpdates: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);

  // Initialize form
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailEnabled: true,
      pushEnabled: true,
      emailFrequency: 'daily',
      notifyOnPortfolioUpdates: true,
      notifyOnMarketAlerts: true,
      notifyOnRiskWarnings: true,
      notifyOnYieldOpportunities: true,
      notifyOnSystemUpdates: true,
    },
  });

  // Load user notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      setIsLoading(true);
      try {
        const prefs = await getNotificationPreferences(user.id);
        
        // Update form values
        form.reset({
          emailEnabled: prefs.emailEnabled,
          pushEnabled: prefs.pushEnabled,
          emailFrequency: prefs.emailFrequency,
          notifyOnPortfolioUpdates: prefs.notifyOnPortfolioUpdates,
          notifyOnMarketAlerts: prefs.notifyOnMarketAlerts,
          notifyOnRiskWarnings: prefs.notifyOnRiskWarnings,
          notifyOnYieldOpportunities: prefs.notifyOnYieldOpportunities,
          notifyOnSystemUpdates: prefs.notifyOnSystemUpdates,
        });
        
        // Check browser notification permission
        if ('Notification' in window) {
          setPushPermission(Notification.permission);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [user, router, form, toast]);

  // Handle form submission
  const onSubmit = async (values: NotificationFormValues) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // If enabling push notifications, request permission
      if (values.pushEnabled && pushPermission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) {
          values.pushEnabled = false;
          setPushPermission('denied');
          toast({
            title: 'Permission denied',
            description: 'Push notifications have been disabled as permission was denied',
            variant: 'destructive',
          });
        } else {
          setPushPermission('granted');
        }
      }
      
      // Save preferences
      const preferences: NotificationPreferences = {
        emailEnabled: values.emailEnabled,
        pushEnabled: values.pushEnabled,
        emailFrequency: values.emailFrequency,
        notifyOnPortfolioUpdates: values.notifyOnPortfolioUpdates,
        notifyOnMarketAlerts: values.notifyOnMarketAlerts,
        notifyOnRiskWarnings: values.notifyOnRiskWarnings,
        notifyOnYieldOpportunities: values.notifyOnYieldOpportunities,
        notifyOnSystemUpdates: values.notifyOnSystemUpdates
      };
      
      const success = await saveNotificationPreferences(user.id, preferences);
      
      if (success) {
        toast({
          title: 'Preferences saved',
          description: 'Your notification preferences have been updated',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If not logged in, redirect to auth page
  if (!user && !isLoading) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage how and when you receive notifications
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading preferences...</span>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={form.watch('emailEnabled')}
                    onCheckedChange={(checked) => form.setValue('emailEnabled', checked)}
                  />
                </div>
                
                {form.watch('emailEnabled') && (
                  <div className="ml-6 border-l pl-6">
                    <Label className="mb-3 block">Email Frequency</Label>
                    <RadioGroup
                      value={form.watch('emailFrequency')}
                      onValueChange={(value) => 
                        form.setValue('emailFrequency', value as 'immediate' | 'daily' | 'weekly')
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immediate" id="immediate" />
                        <Label htmlFor="immediate">Immediate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily">Daily Digest</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly">Weekly Summary</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={form.watch('pushEnabled')}
                    onCheckedChange={(checked) => form.setValue('pushEnabled', checked)}
                    disabled={pushPermission === 'denied'}
                  />
                </div>
                
                {pushPermission === 'denied' && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    Push notifications are blocked by your browser. Please update your browser settings to enable them.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
                <CardDescription>
                  Choose which types of notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="portfolio-updates">Portfolio Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications when your portfolio metrics change significantly
                    </p>
                  </div>
                  <Switch
                    id="portfolio-updates"
                    checked={form.watch('notifyOnPortfolioUpdates')}
                    onCheckedChange={(checked) => form.setValue('notifyOnPortfolioUpdates', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="market-alerts">Market Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about significant market events and conditions
                    </p>
                  </div>
                  <Switch
                    id="market-alerts"
                    checked={form.watch('notifyOnMarketAlerts')}
                    onCheckedChange={(checked) => form.setValue('notifyOnMarketAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="risk-warnings">Risk Warnings</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications when risk levels change in your portfolios
                    </p>
                  </div>
                  <Switch
                    id="risk-warnings"
                    checked={form.watch('notifyOnRiskWarnings')}
                    onCheckedChange={(checked) => form.setValue('notifyOnRiskWarnings', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="yield-opportunities">Yield Opportunities</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about new high-yield investment opportunities
                    </p>
                  </div>
                  <Switch
                    id="yield-opportunities"
                    checked={form.watch('notifyOnYieldOpportunities')}
                    onCheckedChange={(checked) => form.setValue('notifyOnYieldOpportunities', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about platform updates and announcements
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={form.watch('notifyOnSystemUpdates')}
                    onCheckedChange={(checked) => form.setValue('notifyOnSystemUpdates', checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
