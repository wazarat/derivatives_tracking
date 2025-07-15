"use client";
'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface SectorTileProps {
  title: string;
  route: string;
  enabled: boolean;
}

export function SectorTile({ title, route, enabled }: SectorTileProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between p-6 rounded-lg border bg-card text-card-foreground shadow hover:shadow-md transition-all",
        enabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"
      )}
    >
      {!enabled && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
          COMING SOON
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          View metrics and analysis for {title.toLowerCase()} markets.
        </p>
      </div>
      
      {enabled ? (
        <Link 
          href={route} 
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View Dashboard
        </Link>
      ) : (
        <button 
          disabled
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50"
        >
          View Dashboard
        </button>
      )}
    </div>
  );
}
