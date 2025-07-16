'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PortfolioBuilder } from '../../../components/portfolio/PortfolioBuilder';
import { getPortfolioById, createEmptyPortfolio, Portfolio } from '../../../services/portfolioService';
import { fetchAssets } from '../../../services/assetService';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditPortfolioPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const portfolioId = params.id;
  
  // Fetch all available assets
  const { data: assetsResponse, isLoading: isLoadingAssets, error: assetsError } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(),
  });

  // Extract the assets array from the response
  const assets = assetsResponse?.data || [];

  // Get portfolio data
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState(false);

  useEffect(() => {
    // Load portfolio from localStorage
    const loadedPortfolio = getPortfolioById(portfolioId);
    if (loadedPortfolio) {
      setPortfolio(loadedPortfolio);
    } else {
      setPortfolioError(true);
    }
    setIsLoadingPortfolio(false);
  }, [portfolioId]);

  // Handle loading states
  if (isLoadingAssets || isLoadingPortfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading...</h2>
        <p className="text-muted-foreground">Loading your portfolio</p>
      </div>
    );
  }

  // Handle error states
  if (assetsError || portfolioError) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-destructive">
          <h2 className="text-xl font-medium">Portfolio Not Found</h2>
          <p className="mb-6">The portfolio you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => router.push('/portfolios')}>
            View All Portfolios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 mb-4" 
          onClick={() => router.push('/portfolios')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolios
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Portfolio
        </h1>
        <p className="text-muted-foreground mt-2">
          Make changes to your portfolio and save when you're done
        </p>
      </div>

      <PortfolioBuilder 
        availableAssets={assets}
        initialPortfolio={portfolio}
        onSave={() => {
          router.push('/portfolios');
        }}
      />
    </div>
  );
}
