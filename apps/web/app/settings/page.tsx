"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "../../components/ui/use-toast";

export default function SettingsPage() {
  // Account settings
  const [email, setEmail] = useState("user@example.com");
  const [name, setName] = useState("John Doe");
  const [username, setUsername] = useState("johndoe");
  
  // Appearance settings
  const [theme, setTheme] = useState("system");
  const [density, setDensity] = useState("comfortable");
  const [colorScheme, setColorScheme] = useState("blue");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(false);
  
  // Privacy settings
  const [publicProfile, setPublicProfile] = useState(false);
  const [shareWatchlist, setShareWatchlist] = useState(false);
  const [sharePortfolio, setSharePortfolio] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  
  // API settings
  const [apiKey, setApiKey] = useState("••••••••••••••••");
  const [apiEnabled, setApiEnabled] = useState(false);
  
  const handleSaveSettings = (section: string) => {
    // In a real app, we would save the settings to the backend
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been saved.`,
    });
  };
  
  const handleGenerateApiKey = () => {
    // In a real app, we would generate a new API key
    setApiKey("api_" + Math.random().toString(36).substring(2, 15));
    toast({
      title: "API key generated",
      description: "Your new API key has been generated.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>
            
            {/* Account Settings Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type="password"
                        value="••••••••••••"
                        disabled
                      />
                      <Button variant="outline">Change</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("account")}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive">Delete Account</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Appearance Settings Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how CanHav looks and feels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose between light, dark, or system theme.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="density">Density</Label>
                    <RadioGroup id="density" value={density} onValueChange={setDensity} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="comfortable" />
                        <Label htmlFor="comfortable">Comfortable</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compact" id="compact" />
                        <Label htmlFor="compact">Compact</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Adjust the spacing and density of UI elements.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {["blue", "green", "purple", "orange", "red"].map((color) => (
                        <button
                          key={color}
                          className={`h-8 w-full rounded-md ${
                            colorScheme === color ? "ring-2 ring-primary ring-offset-2" : ""
                          }`}
                          style={{ backgroundColor: `var(--${color})` }}
                          onClick={() => setColorScheme(color)}
                        >
                          {colorScheme === color && (
                            <Check className="h-4 w-4 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose your preferred accent color.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("appearance")}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Notifications Settings Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="price-alerts">Price Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when assets reach your target price
                      </p>
                    </div>
                    <Switch
                      id="price-alerts"
                      checked={priceAlerts}
                      onCheckedChange={setPriceAlerts}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-digest">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your portfolio performance
                      </p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="market-updates">Market Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about significant market movements
                      </p>
                    </div>
                    <Switch
                      id="market-updates"
                      checked={marketUpdates}
                      onCheckedChange={setMarketUpdates}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("notification")}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Privacy Settings Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your data and privacy preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="public-profile">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your profile
                      </p>
                    </div>
                    <Switch
                      id="public-profile"
                      checked={publicProfile}
                      onCheckedChange={setPublicProfile}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-watchlist">Share Watchlist</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your watchlist visible to others
                      </p>
                    </div>
                    <Switch
                      id="share-watchlist"
                      checked={shareWatchlist}
                      onCheckedChange={setShareWatchlist}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-portfolio">Share Portfolio</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your portfolio visible to others
                      </p>
                    </div>
                    <Switch
                      id="share-portfolio"
                      checked={sharePortfolio}
                      onCheckedChange={setSharePortfolio}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics-consent">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect anonymous usage data to improve the platform
                      </p>
                    </div>
                    <Switch
                      id="analytics-consent"
                      checked={analyticsConsent}
                      onCheckedChange={setAnalyticsConsent}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("privacy")}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Manage your data stored on our platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Export Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Download all your data in a machine-readable format.
                    </p>
                    <Button variant="outline">Export Data</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* API Settings Tab */}
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Settings</CardTitle>
                  <CardDescription>
                    Manage your API access for integrations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="api-enabled">API Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable API access for third-party integrations
                      </p>
                    </div>
                    <Switch
                      id="api-enabled"
                      checked={apiEnabled}
                      onCheckedChange={setApiEnabled}
                    />
                  </div>
                  
                  {apiEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="api-key"
                          value={apiKey}
                          readOnly
                          className="font-mono"
                        />
                        <Button variant="outline" onClick={handleGenerateApiKey}>
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep this key secret. It provides full access to your account via the API.
                      </p>
                    </div>
                  )}
                  
                  {apiEnabled && (
                    <div className="space-y-2 pt-4">
                      <h3 className="text-lg font-medium">API Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how to use our API to build integrations.
                      </p>
                      <Button variant="outline">View Documentation</Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSaveSettings("api")}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
