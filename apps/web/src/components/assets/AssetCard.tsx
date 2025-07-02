import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Asset, riskTierColors, riskTierDisplayNames, sectorDisplayNames } from '@/types/assets';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { WatchlistButton } from '@/components/assets/WatchlistButton';

interface AssetCardProps {
  asset: Asset;
  className?: string;
  onWatchlistChange?: () => void;
}

export function AssetCard({ asset, className = '', onWatchlistChange }: AssetCardProps) {
  // Format risk score to one decimal place if available
  const riskScore = asset.risk_score !== undefined 
    ? asset.risk_score.toFixed(1) 
    : '-';
  
  // Default logo if none provided
  const logoUrl = asset.logo_url || '/assets/default-token.svg';
  
  // Get risk tier color
  const riskColor = riskTierColors[asset.risk_tier];
  
  return (
    <div className={`rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all bg-card ${className}`}>
      <Link 
        href={`/assets/${asset.id}`}
        className="block p-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-200">
            <Image 
              src={logoUrl} 
              alt={asset.name} 
              fill 
              className="object-cover"
              onError={(e) => {
                // Fallback to default image on error
                const target = e.target as HTMLImageElement;
                target.src = '/assets/default-token.svg';
              }}
            />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{asset.name}</h3>
                <p className="text-sm text-muted-foreground">{asset.ticker}</p>
              </div>
              
              <div className="text-right">
                <div 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${riskColor}20`, color: riskColor }}
                >
                  {riskTierDisplayNames[asset.risk_tier]}
                </div>
                <p className="text-sm mt-1 flex items-center justify-end gap-1">
                  Risk: {riskScore}/5
                  <InfoTooltip 
                    term="Risk Score" 
                    context="Composite risk assessment"
                    iconSize={12}
                  />
                </p>
              </div>
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs px-2 py-1 bg-secondary rounded-md flex items-center gap-1">
                {sectorDisplayNames[asset.sector]}
                <InfoTooltip 
                  term={sectorDisplayNames[asset.sector]} 
                  context="Crypto sector"
                  iconSize={12}
                  iconClassName="text-secondary-foreground/70"
                />
              </span>
              
              {/* APY with tooltip */}
              {asset.market_data?.apy && (
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  {(asset.market_data.apy * 100).toFixed(2)}% APY
                  <InfoTooltip 
                    term="APY" 
                    context="Annual Percentage Yield"
                    iconSize={12}
                    iconClassName="text-green-600/70"
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Watchlist button in card footer */}
      <div className="px-4 py-2 border-t border-gray-100 flex justify-end">
        <WatchlistButton 
          asset={asset}
          variant="ghost"
          size="sm"
          onToggle={onWatchlistChange}
        />
      </div>
    </div>
  );
}
