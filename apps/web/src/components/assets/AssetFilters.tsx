import React from 'react';
import { Sector, RiskTier, sectorDisplayNames, riskTierDisplayNames } from '@/types/assets';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export type AssetFilterValues = {
  search: string;
  sectors: Sector[];
  riskTiers: RiskTier[];
  minRiskScore: number;
  maxRiskScore: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

interface AssetFiltersProps {
  filters: AssetFilterValues;
  onFilterChange: (filters: Partial<AssetFilterValues>) => void;
  onResetFilters: () => void;
  availableSectors: Sector[];
  availableRiskTiers: RiskTier[];
}

export function AssetFilters({
  filters,
  onFilterChange,
  onResetFilters,
  availableSectors,
  availableRiskTiers
}: AssetFiltersProps) {
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  // Handle sector selection
  const toggleSector = (sector: Sector) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    
    onFilterChange({ sectors: newSectors });
  };

  // Handle risk tier selection
  const toggleRiskTier = (tier: RiskTier) => {
    const newTiers = filters.riskTiers.includes(tier)
      ? filters.riskTiers.filter(t => t !== tier)
      : [...filters.riskTiers, tier];
    
    onFilterChange({ riskTiers: newTiers });
  };

  // Handle risk score range change
  const handleRiskScoreChange = (values: number[]) => {
    onFilterChange({
      minRiskScore: values[0],
      maxRiskScore: values[1]
    });
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    if (sortBy === filters.sortBy) {
      // Toggle sort order if same field
      onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      // New sort field, default to ascending
      onFilterChange({ sortBy, sortOrder: 'asc' });
    }
  };

  // Count active filters
  const activeFilterCount = 
    (filters.search ? 1 : 0) +
    filters.sectors.length +
    filters.riskTiers.length +
    (filters.minRiskScore > 1 || filters.maxRiskScore < 5 ? 1 : 0);

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
          {filters.search && (
            <button
              className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => onFilterChange({ search: '' })}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Sector filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                Sectors
                {filters.sectors.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.sectors.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableSectors.map((sector) => (
                <DropdownMenuCheckboxItem
                  key={sector}
                  checked={filters.sectors.includes(sector)}
                  onCheckedChange={() => toggleSector(sector)}
                >
                  {sectorDisplayNames[sector]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Risk tier filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                Risk Tiers
                {filters.riskTiers.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.riskTiers.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableRiskTiers.map((tier) => (
                <DropdownMenuCheckboxItem
                  key={tier}
                  checked={filters.riskTiers.includes(tier)}
                  onCheckedChange={() => toggleRiskTier(tier)}
                >
                  {riskTierDisplayNames[tier]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                Sort
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem
                checked={filters.sortBy === 'name'}
                onCheckedChange={() => handleSortChange('name')}
              >
                Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.sortBy === 'risk_score'}
                onCheckedChange={() => handleSortChange('risk_score')}
              >
                Risk Score {filters.sortBy === 'risk_score' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.sortBy === 'market_cap'}
                onCheckedChange={() => handleSortChange('market_cap')}
              >
                Market Cap {filters.sortBy === 'market_cap' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset filters button */}
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear filters ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Risk score range slider */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <Label>Risk Score Range</Label>
          <span className="text-sm text-muted-foreground">
            {filters.minRiskScore} - {filters.maxRiskScore}
          </span>
        </div>
        <Slider
          defaultValue={[filters.minRiskScore, filters.maxRiskScore]}
          min={1}
          max={5}
          step={0.5}
          onValueChange={handleRiskScoreChange}
          className="w-full"
        />
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({ search: '' })}
              />
            </Badge>
          )}
          
          {filters.sectors.map(sector => (
            <Badge key={sector} variant="secondary" className="flex items-center gap-1">
              {sectorDisplayNames[sector]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleSector(sector)}
              />
            </Badge>
          ))}
          
          {filters.riskTiers.map(tier => (
            <Badge key={tier} variant="secondary" className="flex items-center gap-1">
              {riskTierDisplayNames[tier]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleRiskTier(tier)}
              />
            </Badge>
          ))}
          
          {(filters.minRiskScore > 1 || filters.maxRiskScore < 5) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Risk: {filters.minRiskScore}-{filters.maxRiskScore}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange({ minRiskScore: 1, maxRiskScore: 5 })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
