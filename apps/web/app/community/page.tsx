"use client";

import { Users, MessageCircle, Share2, TrendingUp, Bell, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../src/components/ui/badge";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Community Hub</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow crypto traders and investors to share insights and stay updated
          </p>
        </div>

        {/* Development Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800 dark:text-orange-200">
                Coming Soon!
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Our community features are currently under development and will be launched soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800 dark:text-orange-200 mb-4">
              You'll be able to share insights and get knowledge from other users to ensure you have the most updated information about the crypto markets.
            </p>
            <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
              <Mail className="h-4 w-4" />
              <span>We'll notify you via email once the community features are ready!</span>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="opacity-75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Discussion Forums</CardTitle>
              </div>
              <CardDescription>
                Join conversations about market trends, trading strategies, and crypto insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">Market Analysis</Badge>
                <Badge variant="secondary" className="text-xs">Trading Tips</Badge>
                <Badge variant="secondary" className="text-xs">DeFi Strategies</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Share Insights</CardTitle>
              </div>
              <CardDescription>
                Share your research, analysis, and market observations with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">Research Reports</Badge>
                <Badge variant="secondary" className="text-xs">Price Predictions</Badge>
                <Badge variant="secondary" className="text-xs">News Updates</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Real-time Updates</CardTitle>
              </div>
              <CardDescription>
                Get the latest market information and community insights in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">Live Discussions</Badge>
                <Badge variant="secondary" className="text-xs">Market Alerts</Badge>
                <Badge variant="secondary" className="text-xs">Community Signals</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Stay Connected</CardTitle>
            <CardDescription>
              Be the first to know when our community features go live
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We're working hard to bring you the best community experience for crypto traders and investors.
              You'll receive an email notification as soon as these features are available.
            </p>
            <Button disabled className="cursor-not-allowed">
              <Bell className="h-4 w-4 mr-2" />
              Notifications Enabled
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
