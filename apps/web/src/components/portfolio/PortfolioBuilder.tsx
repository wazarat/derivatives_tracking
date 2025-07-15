'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Asset } from '@/types/assets';
import { 
  Portfolio, 
  PortfolioEntry, 
  createEmptyPortfolio, 
  addAssetToPortfolio, 
  removeAssetFromPortfolio, 
  updateAssetAllocation, 
  calculatePortfolioAPY, 
  calculatePortfolioRisk,
  calculatePortfolioVolatility,
  savePortfolioToLocalStorage
} from '@/services/portfolioService';
import { savePortfolioToSupabase } from '@/services/supabasePortfolioService';
import { useAuth } from '@/contexts/AuthContext';
import { DraggableAsset } from './DraggableAsset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Loader2, Save, Plus, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PortfolioBuilderProps {
  availableAssets?: Asset[];
  initialPortfolio?: Portfolio;
  onSave?: (portfolio: Portfolio) => void;
  isLoading?: boolean;
}

export function PortfolioBuilder({ 
  availableAssets = [], 
  initialPortfolio,
  onSave,
  isLoading: externalLoading = false 
}: PortfolioBuilderProps) {
  const [portfolio, setPortfolio] = useState<Portfolio>(initialPortfolio || createEmptyPortfolio());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAllocationValid, setIsAllocationValid] = useState(true);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Get the active entry for drag overlay
  const activeEntry = activeId 
    ? portfolio.entries.find(entry => entry.assetId === activeId) 
    : null;

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate portfolio metrics
  const portfolioAPY = calculatePortfolioAPY(portfolio);
  const portfolioRisk = calculatePortfolioRisk(portfolio);
  const portfolioVolatility = calculatePortfolioVolatility(portfolio);

  // Check if allocation sums to 100%
  const totalAllocation = portfolio.entries.reduce((sum, entry) => sum + entry.allocation, 0);
  setIsAllocationValid(totalAllocation === 100);

  // Handle portfolio name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPortfolio(prev => ({ ...prev, name: e.target.value }));
  };

  // Handle portfolio description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPortfolio(prev => ({ ...prev, description: e.target.value }));
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPortfolio(portfolio => {
        const oldIndex = portfolio.entries.findIndex(entry => entry.assetId === active.id);
        const newIndex = portfolio.entries.findIndex(entry => entry.assetId === over.id);
        
        return {
          ...portfolio,
          entries: arrayMove(portfolio.entries, oldIndex, newIndex),
        };
      });
    }
    
    setActiveId(null);
  };

  // Add asset to portfolio
  const handleAddAsset = (asset: Asset) => {
    // Default allocation based on existing entries
    const defaultAllocation = portfolio.entries.length === 0 
      ? 100 
      : Math.floor(100 / (portfolio.entries.length + 1));
    
    const updatedPortfolio = addAssetToPortfolio(portfolio, asset, defaultAllocation);
    setPortfolio(updatedPortfolio);
    
    toast({
      title: "Asset added",
      description: `${asset.name} added to portfolio`,
    });
  };

  // Remove asset from portfolio
  const handleRemoveAsset = (assetId: string) => {
    const updatedPortfolio = removeAssetFromPortfolio(portfolio, assetId);
    setPortfolio(updatedPortfolio);
    
    toast({
      title: "Asset removed",
      description: "Asset removed from portfolio",
    });
  };

  // Update asset allocation
  const handleAllocationChange = (assetId: string, allocation: number) => {
    const updatedPortfolio = updateAssetAllocation(portfolio, assetId, allocation);
    setPortfolio(updatedPortfolio);
  };

  // Save portfolio
  const handleSave = async () => {
    if (!isAllocationValid) {
      toast({
        title: "Invalid allocation",
        description: "Total allocation must equal 100%",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Always save to localStorage for offline access
      savePortfolioToLocalStorage(portfolio);
      
      // If user is logged in, also save to Supabase
      if (user) {
        const savedPortfolio = await savePortfolioToSupabase(portfolio, user.id);
        if (savedPortfolio) {
          // Update local portfolio with any server-generated IDs
          setPortfolio(savedPortfolio);
        } else {
          throw new Error("Failed to save portfolio to cloud");
        }
      }
      
      toast({
        title: "Portfolio saved",
        description: user 
          ? "Your portfolio has been saved to your account" 
          : "Your portfolio has been saved locally",
      });
      
      // Call external onSave handler if provided
      if (onSave) {
        onSave(portfolio);
      }
    } catch (error) {
      console.error("Error saving portfolio:", error);
      toast({
        title: "Save failed",
        description: `Could not save portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle portfolio public status
  const handleTogglePublic = () => {
    setPortfolio(prev => ({
      ...prev,
      isPublic: !prev.isPublic
    }));
  };

  return (
    <div className="space-y-6">
      {/* Portfolio details */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
          <CardDescription>Name and describe your investment portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="portfolio-name" className="block text-sm font-medium mb-1">
              Portfolio Name
            </label>
            <Input
              id="portfolio-name"
              placeholder="My Crypto Portfolio"
              value={portfolio.name}
              onChange={(e) => setPortfolio({ ...portfolio, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="portfolio-description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <Textarea
              id="portfolio-description"
              placeholder="Describe your investment strategy..."
              value={portfolio.description}
              onChange={(e) => setPortfolio({ ...portfolio, description: e.target.value })}
              rows={3}
            />
          </div>
          {user && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="public-portfolio" 
                checked={portfolio.isPublic} 
                onCheckedChange={handleTogglePublic} 
              />
              <Label htmlFor="public-portfolio" className="flex items-center">
                {portfolio.isPublic ? (
                  <Unlock className="h-4 w-4 mr-1" />
                ) : (
                  <Lock className="h-4 w-4 mr-1" />
                )}
                {portfolio.isPublic ? 'Public portfolio' : 'Private portfolio'}
              </Label>
              <InfoTooltip 
                content={
                  portfolio.isPublic 
                    ? "Public portfolios can be viewed by anyone and may appear in trending lists" 
                    : "Private portfolios are only visible to you"
                } 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Metrics</CardTitle>
          <CardDescription>Key performance and risk indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                Expected APY
                <InfoTooltip term="APY" context="Portfolio weighted average" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {portfolioAPY !== null ? `${(portfolioAPY * 100).toFixed(2)}%` : '-'}
              </div>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                Risk Score
                <InfoTooltip term="Risk Score" context="Portfolio weighted average" />
              </div>
              <div className="text-2xl font-bold">
                {portfolioRisk !== null ? portfolioRisk.toFixed(1) : '-'}/5
              </div>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                Volatility (30d)
                <InfoTooltip term="Volatility" context="Portfolio weighted average" />
              </div>
              <div className="text-2xl font-bold">
                {portfolioVolatility !== null ? portfolioVolatility.toFixed(2) : '-'}
              </div>
            </div>
          </div>
          
          {/* Allocation warning */}
          {portfolio.entries.length > 0 && !isAllocationValid && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
              Total allocation: {totalAllocation}% (should be 100%)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio assets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assets</CardTitle>
            <CardDescription>Drag to reorder, adjust allocations</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAssetSelector(!showAssetSelector)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </CardHeader>
        <CardContent>
          {externalLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading portfolio...</span>
            </div>
          ) : portfolio.entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No assets in portfolio yet</p>
              <p className="text-sm mt-2">Add assets from the available assets section below</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={portfolio.entries.map(entry => entry.assetId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {portfolio.entries.map(entry => (
                    <DraggableAsset
                      key={entry.assetId}
                      asset={entry.asset}
                      allocation={entry.allocation}
                      onRemove={() => handleRemoveAsset(entry.assetId)}
                      onAllocationChange={(allocation) => 
                        handleAllocationChange(entry.assetId, allocation)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeEntry && (
                  <DraggableAsset
                    asset={activeEntry.asset}
                    allocation={activeEntry.allocation}
                    onRemove={() => {}}
                    onAllocationChange={() => {}}
                    isDragging={true}
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {user ? (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-1" />
                Saving to your account
              </span>
            ) : (
              <span className="flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                <a href="/auth" className="underline">Sign in</a> to save to cloud
              </span>
            )}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || portfolio.entries.length === 0 || !isAllocationValid}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Portfolio
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Available assets */}
      <Card>
        <CardHeader>
          <CardTitle>Available Assets</CardTitle>
          <CardDescription>Click to add assets to your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {availableAssets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No assets available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAssets
                .filter(asset => !portfolio.entries.some(entry => entry.assetId === asset.id))
                .map(asset => (
                  <Card key={asset.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                          <Image 
                            src={asset.logo_url || '/assets/default-token.svg'} 
                            alt={asset.name} 
                            fill 
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/default-token.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{asset.name}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{asset.ticker}</span>
                            {asset.market_data?.apy && (
                              <span className="text-green-600">
                                {(asset.market_data.apy * 100).toFixed(2)}% APY
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAddAsset(asset)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
