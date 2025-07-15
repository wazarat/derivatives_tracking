"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../components/ui/button';
import { ArrowRight, BarChart3, LineChart, Shield, Zap, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Advanced Crypto Analytics & Portfolio Management
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Real-time market data, portfolio tracking, and risk analysis for crypto traders and investors.
                </p>
              </div>
              {!isSignedIn && (
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="gap-1.5">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/research">
                    <Button size="lg" variant="outline">
                      Explore Markets
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-background p-2 shadow-lg">
                <div className="bg-muted h-full w-full rounded-lg flex items-center justify-center">
                  <LineChart className="h-24 w-24 text-primary opacity-50" />
                  <span className="sr-only">Dashboard Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Features for Crypto Traders
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to analyze markets, track portfolios, and make informed decisions.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Market Research</CardTitle>
                <CardDescription>
                  Comprehensive market data and analytics for informed decision-making
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Access real-time data from CoinMarketCap, dYdX, and Hyperliquid. Track price movements, volume, and market trends across multiple exchanges.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/research" className="text-sm text-primary flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Portfolio Tracking</CardTitle>
                <CardDescription>
                  Monitor your crypto holdings and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Track your portfolio performance with advanced metrics. Analyze historical returns, volatility, and correlations to optimize your investment strategy.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/portfolio" className="text-sm text-primary flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>
                  Identify and mitigate risks in your crypto portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Evaluate risk exposure with sophisticated models. Get recommendations for portfolio rebalancing to maintain your desired risk profile.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/risk" className="text-sm text-primary flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Get insights and answers from our AI-powered chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Ask questions about crypto markets, assets, and trends. Our AI assistant provides data-driven insights and explanations to help you make better decisions.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/chatbot" className="text-sm text-primary flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sector Analysis</CardTitle>
                <CardDescription>
                  Track performance across different crypto sectors
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Analyze performance by crypto market sectors. Identify trends in DeFi, NFTs, Layer 1s, and other segments to spot emerging opportunities.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/sectors" className="text-sm text-primary flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>
                  Track your favorite crypto assets in one place
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Create custom watchlists to monitor assets you're interested in. Set price alerts and get notifications when market conditions change.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/watchlist" className="text-sm text-primary flex items-center">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to elevate your crypto trading?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of traders using CanHav to make data-driven decisions.
              </p>
            </div>
            {!isSignedIn && (
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="gap-1.5">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/research">
                  <Button size="lg" variant="outline">
                    Explore Markets
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
