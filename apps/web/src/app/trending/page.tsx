'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '@/services/assetService';
import { getPublicPortfoliosFromSupabase } from '@/services/supabasePortfolioService';
import { Portfolio, calculatePortfolioAPY, calculatePortfolioRisk } from '@/services/portfolioService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ArrowUpRight, Copy, Eye, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Demo data for trending portfolios (will be replaced with real data)
const DEMO_PORTFOLIOS = [
  {
    id: 'demo-conservative',
    name: 'Conservative Yield',
    description: 'Low-risk portfolio focused on stable yields from established protocols',
    userId: 'demo-user',
    isPublic: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    views: 124,
    clones: 18,
    riskScore: 1.8,
    apy: 5.2
  },
  {
    id: 'demo-balanced',
    name: 'Balanced Growth',
    description: 'Moderate risk portfolio with a mix of stablecoins and blue-chip tokens',
    userId: 'demo-user',
    isPublic: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    views: 256,
    clones: 42,
    riskScore: 3.2,
    apy: 8.7
  },
  {
    id: 'demo-aggressive',
    name: 'Aggressive Growth',
    description: 'Higher risk portfolio targeting maximum yield across DeFi protocols',
    userId: 'demo-user',
    isPublic: true,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    views: 189,
    clones: 31,
    riskScore: 4.5,
    apy: 12.3
  },
  {
    id: 'demo-stablecoin',
    name: 'Pure Stablecoin',
    description: 'Ultra-conservative portfolio with 100% stablecoin allocation',
    userId: 'demo-user',
    isPublic: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    views: 142,
    clones: 27,
    riskScore: 1.2,
    apy: 4.8
  },
  {
    id: 'demo-rwa',
    name: 'Real World Assets',
    description: 'Portfolio focused on tokenized real-world assets for stable returns',
    userId: 'demo-user',
    isPublic: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    views: 98,
    clones: 15,
    riskScore: 2.1,
    apy: 6.5
  },
  {
    id: 'demo-defi',
    name: 'DeFi Maximalist',
    description: 'High-yield portfolio focusing on DeFi blue chips and yield aggregators',
    userId: 'demo-user',
    isPublic: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    views: 215,
    clones: 38,
    riskScore: 3.9,
    apy: 10.2
  }
];

type TrendingPortfolio = Portfolio & {
  views: number;
  clones: number;
  riskScore: number;
  apy: number;
};

export default function TrendingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<TrendingPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular');

  // Fetch all assets for portfolio display
  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(),
  });

  // Load public portfolios
  useEffect(() => {
    const loadPortfolios = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, we would fetch actual public portfolios from Supabase
        // and calculate their popularity metrics
        
        // For now, use demo data
        const demoPortfolios = [...DEMO_PORTFOLIOS];
        
        // Sort based on active tab
        if (activeTab === 'popular') {
          demoPortfolios.sort((a, b) => b.views - a.views);
        } else if (activeTab === 'newest') {
          demoPortfolios.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else if (activeTab === 'highest-yield') {
          demoPortfolios.sort((a, b) => b.apy - a.apy);
        } else if (activeTab === 'lowest-risk') {
          demoPortfolios.sort((a, b) => a.riskScore - b.riskScore);
        }
        
        setPortfolios(demoPortfolios as TrendingPortfolio[]);
      } catch (error) {
        console.error('Error loading trending portfolios:', error);
        toast({
          title: 'Error loading portfolios',
          description: 'There was a problem loading trending portfolios'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPortfolios();
  }, [activeTab, toast]);

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'recently';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Get risk label
  const getRiskLabel = (risk: number): string => {
    if (risk < 2) return 'Very Low Risk';
    if (risk < 3) return 'Low Risk';
    if (risk < 4) return 'Moderate Risk';
    if (risk < 5) return 'High Risk';
    return 'Very High Risk';
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trending Portfolios</h1>
          <p className="text-muted-foreground mt-2">
            Discover and explore popular investment strategies from the community
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => router.push('/portfolio')}>
            Create Your Own
          </Button>
          <Button variant="outline" onClick={() => router.push('/smart-allocate')} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Smart Allocate
          </Button>
        </div>
      </div>

      <Tabs defaultValue="popular" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-[600px]">
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="highest-yield">Highest Yield</TabsTrigger>
          <TabsTrigger value="lowest-risk">Lowest Risk</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="truncate">{portfolio.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      <span>{portfolio.views} views</span>
                      <span>•</span>
                      <span>Updated {formatDate(portfolio.updatedAt)}</span>
                    </CardDescription>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                    {portfolio.clones} clones
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {portfolio.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {portfolio.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Expected APY</div>
                    <div className="text-xl font-semibold">
                      {portfolio.apy.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Risk Score</div>
                    <div className="text-xl font-semibold">
                      {portfolio.riskScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getRiskLabel(portfolio.riskScore)}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push(`/p/${portfolio.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => router.push(`/smart-allocate?clone=${portfolio.id}`)}
                >
                  Clone Portfolio
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
