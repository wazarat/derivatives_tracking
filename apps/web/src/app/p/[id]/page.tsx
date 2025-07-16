'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '../../../services/assetService';
import { getPublicPortfoliosFromSupabase } from '../../../services/supabasePortfolioService';
import { Portfolio, calculatePortfolioAPY, calculatePortfolioRisk } from '../../../services/portfolioService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Skeleton } from '../../../components/ui/skeleton';
import { useToast } from '../../../components/ui/use-toast';
import { ArrowLeft, Copy, Loader2, Share2, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function PublicPortfolioPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available assets
  const { data: assetsResponse, isLoading: isLoadingAssets, error: assetsError } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(),
  });

  // Extract the assets array from the response
  const assets = assetsResponse?.data || [];

  // Load the public portfolio
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!params.id || assets.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const portfolios = await getPublicPortfoliosFromSupabase(assets);
        const publicPortfolio = portfolios.find(p => p.id === params.id);
        
        if (!publicPortfolio) {
          setError('Portfolio not found or is not public');
          return;
        }
        
        if (!publicPortfolio.isPublic) {
          setError('This portfolio is not public');
          return;
        }
        
        setPortfolio(publicPortfolio);
      } catch (error) {
        console.error('Error loading public portfolio:', error);
        setError('Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (assets.length > 0) {
      loadPortfolio();
    }
  }, [params.id, assets]);

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied',
      description: 'Portfolio link copied to clipboard',
    });
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown date';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Calculate portfolio metrics
  const apy = portfolio ? calculatePortfolioAPY(portfolio) : 0;
  const risk = portfolio ? calculatePortfolioRisk(portfolio) : 0;

  // Prepare data for pie chart
  const chartData = portfolio?.entries?.map(entry => ({
    name: entry.asset.name,
    value: entry.allocation,
    color: getAssetColor(entry.asset.sector.toString()),
  })) || [];

  // Loading state
  if (isLoading || isLoadingAssets) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/portfolios">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !portfolio) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/portfolios">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-xl font-semibold mb-2">Portfolio Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'This portfolio does not exist or is not public'}</p>
            <Button asChild>
              <Link href="/portfolios">View All Portfolios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/portfolios">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-1" onClick={handleCopyLink}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{portfolio.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{portfolio.userId ? `User ${portfolio.userId}` : 'Anonymous'}</span>
          <span>•</span>
          <span>Created {formatDate(portfolio.createdAt)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
            <CardDescription>Asset distribution by percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {portfolio.entries && portfolio.entries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Allocation']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No assets in portfolio</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Expected APY</p>
                  <h3 className="text-3xl font-bold">{apy ? apy.toFixed(2) : '0.00'}%</h3>
                </div>
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl font-semibold">APY</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <h3 className="text-3xl font-bold">{risk ? risk.toFixed(1) : '0.0'}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getRiskLabel(risk)}
                  </p>
                </div>
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl font-semibold">Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Button className="w-full" onClick={() => {
                // Clone this portfolio
                router.push(`/smart-allocate?clone=${params.id}`);
              }}>
                <Copy className="mr-2 h-4 w-4" />
                Clone This Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Assets</CardTitle>
          <CardDescription>
            Detailed breakdown of assets in this portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.entries && portfolio.entries.map((entry, index) => (
              <div key={entry.asset.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getAssetColor(entry.asset.sector.toString()) + '33' }}
                    >
                      <span className="text-sm font-medium">{entry.asset.symbol}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{entry.asset.name}</h4>
                      <p className="text-sm text-muted-foreground">{entry.asset.sector.toString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.allocation}%</p>
                    <p className="text-sm text-muted-foreground">APY: {entry.asset.apy ? entry.asset.apy.toFixed(2) : '0.00'}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get a color based on asset sector
function getAssetColor(sector: string): string {
  const colorMap: Record<string, string> = {
    'Stablecoins': '#3B82F6', // blue
    'Tokenized RWAs': '#10B981', // green
    'Liquid Staking': '#6366F1', // indigo
    'DeFi Bluechips': '#8B5CF6', // violet
    'L1/L2 Tokens': '#EC4899', // pink
    'Yield Aggregators': '#F59E0B', // amber
    'Liquid Restaking': '#14B8A6', // teal
    'Real World Assets': '#22C55E', // emerald
    'Options Vaults': '#F97316', // orange
  };
  
  return colorMap[sector] || '#6B7280'; // gray as default
}

// Helper function to get risk label
function getRiskLabel(risk: number | null): string {
  if (risk === null) return 'Unknown Risk';
  if (risk < 2) return 'Very Low Risk';
  if (risk < 3) return 'Low Risk';
  if (risk < 4) return 'Moderate Risk';
  if (risk < 5) return 'High Risk';
  return 'Very High Risk';
}
