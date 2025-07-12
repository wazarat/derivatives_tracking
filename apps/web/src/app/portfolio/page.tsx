'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PortfolioBuilder } from '../../components/portfolio/PortfolioBuilder';
import { getPortfolioById, createEmptyPortfolio } from '../../services/portfolioService';
import { getPortfolioFromSupabase } from '../../services/supabasePortfolioService';
import { fetchAssets } from '../../services/assetService';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ui/use-toast';
import { Asset } from '@/types/assets';

export default function PortfolioPage({
  params
}: {
  params?: { id?: string }
}) {
  const portfolioId = params?.id;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch all available assets
  const { data: assetsResponse, isLoading: isLoadingAssets, error: assetsError } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(),
  });

  // Extract the assets array from the response
  const assets = assetsResponse?.data || [];

  // Get initial portfolio data if editing an existing portfolio
  const [initialPortfolio, setInitialPortfolio] = useState(createEmptyPortfolio());
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(!!portfolioId);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!portfolioId) return;
      
      setIsLoadingPortfolio(true);
      try {
        let portfolio = null;
        
        // Try to load from Supabase first if user is logged in
        if (user && assets.length > 0) {
          portfolio = await getPortfolioFromSupabase(portfolioId, assets);
          
          // Check if this portfolio belongs to the current user
          if (portfolio && portfolio.userId !== user.id) {
            toast({
              title: "Access denied",
              description: "You don't have permission to edit this portfolio"
            });
            router.push('/portfolios');
            return;
          }
        }
        
        // Fall back to localStorage if not found in Supabase
        if (!portfolio) {
          portfolio = getPortfolioById(portfolioId);
        }
        
        if (portfolio) {
          setInitialPortfolio(portfolio);
        } else {
          toast({
            title: "Portfolio not found",
            description: "The requested portfolio could not be found"
          });
          router.push('/portfolios');
        }
      } catch (error) {
        console.error("Error loading portfolio:", error);
        toast({
          title: "Error loading portfolio",
          description: "There was a problem loading the portfolio"
        });
      } finally {
        setIsLoadingPortfolio(false);
      }
    };
    
    if (portfolioId && assets.length > 0) {
      loadPortfolio();
    }
  }, [portfolioId, user, assets, router, toast]);

  // Handle loading states
  if (isLoadingAssets || isLoadingPortfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading...</h2>
        <p className="text-muted-foreground">Preparing your portfolio builder</p>
      </div>
    );
  }

  // Handle error states
  if (assetsError) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load assets. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {portfolioId ? 'Edit Portfolio' : 'Create New Portfolio'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {portfolioId 
              ? 'Make changes to your existing portfolio' 
              : 'Build a custom portfolio by adding and allocating assets'}
          </p>
        </div>
        <Link href="/smart-allocate">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Smart Allocate
          </Button>
        </Link>
      </div>

      <PortfolioBuilder
        availableAssets={assets}
        initialPortfolio={initialPortfolio}
        onSave={(savedPortfolio) => {
          // After successful save, redirect to portfolios list
          router.push('/portfolios');
        }}
      />
    </div>
  );
}
