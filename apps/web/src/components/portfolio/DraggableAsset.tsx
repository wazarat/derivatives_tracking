'use client';

import React from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Asset, riskTierColors, riskTierDisplayNames } from '@/types/assets';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface DraggableAssetProps {
  asset: Asset;
  allocation: number;
  onRemove: () => void;
  onAllocationChange: (allocation: number) => void;
  isDragging?: boolean;
}

export function DraggableAsset({
  asset,
  allocation,
  onRemove,
  onAllocationChange,
  isDragging = false,
}: DraggableAssetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Format risk score to one decimal place if available
  const riskScore = asset.risk_score !== undefined 
    ? asset.risk_score.toFixed(1) 
    : '-';
  
  // Default logo if none provided
  const logoUrl = asset.logo_url || '/assets/default-token.svg';
  
  // Get risk tier color
  const riskColor = riskTierColors[asset.risk_tier];

  // Handle allocation change
  const handleAllocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
      onAllocationChange(newValue);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-card border rounded-lg ${
        isDragging ? 'border-primary' : 'border-border'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Asset logo */}
      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
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

      {/* Asset info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{asset.name}</h3>
          <span className="text-sm text-muted-foreground">{asset.ticker}</span>
          <div 
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${riskColor}20`, color: riskColor }}
          >
            {riskTierDisplayNames[asset.risk_tier]}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            Risk: {riskScore}/5
            <InfoTooltip term="Risk Score" iconSize={12} />
          </span>
          {asset.market_data?.apy && (
            <span className="text-green-600 flex items-center gap-1">
              {(asset.market_data.apy * 100).toFixed(2)}% APY
              <InfoTooltip term="APY" iconSize={12} iconClassName="text-green-600/70" />
            </span>
          )}
        </div>
      </div>

      {/* Allocation input */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <input
            type="number"
            min="0"
            max="100"
            value={allocation}
            onChange={handleAllocationChange}
            className="w-16 h-8 px-2 text-right border rounded-md"
          />
          <span className="ml-1">%</span>
        </div>
        
        {/* Remove button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
