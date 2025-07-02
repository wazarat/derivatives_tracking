'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AssetCard } from '@/components/assets/AssetCard';
import { AssetFilters, AssetFilterValues } from '@/components/assets/AssetFilters';
import { fetchAssets, fetchSectors, fetchRiskTiers } from '@/services/assetService';
import { Asset, Sector, RiskTier } from '@/types/assets';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 12;

export default function AssetsExplorer() {
  // State for filters
  const [filters, setFilters] = useState<AssetFilterValues>({
    search: '',
    sectors: [],
    riskTiers: [],
    minRiskScore: 1,
    maxRiskScore: 5,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // State for pagination
  const [page, setPage] = useState(1);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.sectors, filters.riskTiers, filters.minRiskScore, filters.maxRiskScore]);

  // Fetch available sectors
  const { data: availableSectors = Object.values(Sector) } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      try {
        const sectors = await fetchSectors();
        return sectors.map(s => s as Sector);
      } catch (error) {
        console.error('Failed to fetch sectors:', error);
        return Object.values(Sector);
      }
    },
  });

  // Fetch available risk tiers
  const { data: availableRiskTiers = Object.values(RiskTier) } = useQuery({
    queryKey: ['riskTiers'],
    queryFn: async () => {
      try {
        const tiers = await fetchRiskTiers();
        return tiers.map(t => t as RiskTier);
      } catch (error) {
        console.error('Failed to fetch risk tiers:', error);
        return Object.values(RiskTier);
      }
    },
  });

  // Fetch assets with filters
  const {
    data: assetsResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['assets', filters, page],
    queryFn: async () => {
      const skip = (page - 1) * ITEMS_PER_PAGE;
      return await fetchAssets({
        sectors: filters.sectors,
        risk_tiers: filters.riskTiers,
        min_risk_score: filters.minRiskScore,
        max_risk_score: filters.maxRiskScore,
        search: filters.search,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        skip,
        limit: ITEMS_PER_PAGE,
      });
    },
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<AssetFilterValues>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      sectors: [],
      riskTiers: [],
      minRiskScore: 1,
      maxRiskScore: 5,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  // Calculate total pages
  const totalPages = assetsResponse ? Math.ceil(assetsResponse.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold">Asset Explorer</h1>
        <p className="text-muted-foreground">
          Explore crypto assets across different sectors and risk profiles
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <AssetFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          availableSectors={availableSectors}
          availableRiskTiers={availableRiskTiers}
        />
      </div>

      {/* Results */}
      <div className="mb-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading assets...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-4">
              Error loading assets: {(error as Error).message}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : assetsResponse?.data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No assets found matching your filters</p>
            <Button onClick={handleResetFilters}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Showing {assetsResponse?.data.length} of {assetsResponse?.total} assets
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assetsResponse?.data.map((asset: Asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
