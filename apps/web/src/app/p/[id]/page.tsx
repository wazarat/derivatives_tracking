'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '@/services/assetService';
import { getPublicPortfolioFromSupabase } from '@/services/supabasePortfolioService';
import { Portfolio, calculatePortfolioAPY, calculatePortfolioRisk } from '@/services/portfolioService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Copy, Loader2, Share2, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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

  // Fetch all assets for portfolio display
  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(),
  });

  // Load the public portfolio
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!params.id || !assets) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const publicPortfolio = await getPublicPortfolioFromSupabase(params.id, assets);
        
        if (!publicPortfolio) {
          setError('Portfolio not found or is not public');
          return;
        }
        
        // Verify the portfolio is public
        if (!publicPortfolio.isPublic) {
          setError('This portfolio is private');
          return;
        }
        
        setPortfolio(publicPortfolio);
      } catch (err) {
        console.error('Error loading public portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (assets) {
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
  const chartData = portfolio?.entries.map(entry => ({
    name: entry.asset.name,
    value: entry.allocation,
    color: getAssetColor(entry.asset.sector),
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
  if (error) {
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
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-medium mb-2">Portfolio Not Available</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link href="/portfolios">View Your Portfolios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state with portfolio data
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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{portfolio?.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Shared {formatDate(portfolio?.updatedAt)}</span>
          </div>
        </div>
        <Button variant="outline" onClick={handleCopyLink} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </Button>
      </div>
      
      {portfolio?.description && (
        <p className="text-muted-foreground mb-8">{portfolio.description}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Allocation</CardTitle>
            <CardDescription>
              {portfolio?.entries.length} assets in portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value}%`, 'Allocation']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Expected APY</p>
                  <h3 className="text-3xl font-bold">{apy.toFixed(2)}%</h3>
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
                  <h3 className="text-3xl font-bold">{risk.toFixed(1)}</h3>
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
            {portfolio?.entries.map((entry, index) => (
              <div key={entry.asset.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getAssetColor(entry.asset.sector) + '33' }}
                    >
                      <span className="text-sm font-medium">{entry.asset.symbol}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{entry.asset.name}</h4>
                      <p className="text-sm text-muted-foreground">{entry.asset.sector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.allocation}%</p>
                    <p className="text-sm text-muted-foreground">APY: {entry.asset.apy.toFixed(2)}%</p>
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
function getRiskLabel(risk: number): string {
  if (risk < 2) return 'Very Low Risk';
  if (risk < 3) return 'Low Risk';
  if (risk < 4) return 'Moderate Risk';
  if (risk < 5) return 'High Risk';
  return 'Very High Risk';
}
