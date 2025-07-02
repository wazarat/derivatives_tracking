'use client';

import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getExplanation } from '@/services/explanationService';
import { Skeleton } from '@/components/ui/skeleton';

interface InfoTooltipProps {
  term: string;
  context?: string;
  iconSize?: number;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

/**
 * A reusable tooltip component that displays explanations for financial terms
 * Uses the explanation service to fetch explanations from predefined list or OpenAI
 */
export function InfoTooltip({ 
  term, 
  context, 
  iconSize = 16, 
  iconClassName = 'text-muted-foreground',
  side = 'top',
  align = 'center'
}: InfoTooltipProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch explanation when tooltip is opened
  useEffect(() => {
    if (isOpen && !explanation && !isLoading) {
      setIsLoading(true);
      
      getExplanation(term, context)
        .then((result) => {
          setExplanation(result);
        })
        .catch((error) => {
          console.error(`Error fetching explanation for ${term}:`, error);
          setExplanation(`Unable to load explanation for ${term}.`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, explanation, term, context, isLoading]);

  return (
    <TooltipProvider>
      <Tooltip onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <span className={`cursor-help inline-flex items-center ${iconClassName}`}>
            <Info size={iconSize} />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className="max-w-xs p-3 text-sm"
        >
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p>{explanation || `Loading explanation for ${term}...`}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
