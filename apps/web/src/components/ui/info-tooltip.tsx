"use client"

import React from "react"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Simple mock implementation of explanation service
const getExplanation = async (term: string, context?: string): Promise<string> => {
  // In a real implementation, this would fetch from an API
  const explanations: Record<string, string> = {
    "market cap": "The total value of all coins of a cryptocurrency that have been mined. It's calculated by multiplying the number of coins in circulation by the current market price.",
    "volume": "The total amount of the cryptocurrency that has been traded within the past 24 hours.",
    "circulating supply": "The number of coins of a cryptocurrency that are publicly available and circulating in the market.",
    "max supply": "The maximum number of coins that will ever exist for a cryptocurrency.",
    "price change": "The percentage change in price over a specific time period.",
    "sigma bucket": "A statistical measure grouping assets based on their volatility relative to the market standard deviation.",
    "volatility": "A measure of how much the price of an asset fluctuates over time.",
    "max drawdown": "The maximum observed loss from a peak to a trough of an asset, before a new peak is attained.",
    "sharpe ratio": "A measure of risk-adjusted return, calculated by dividing excess return by standard deviation.",
    "apy": "Annual Percentage Yield, the real rate of return earned on an investment, taking into account the effect of compounding interest."
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return explanations[term.toLowerCase()] || `No explanation available for "${term}"`
}

export interface InfoTooltipProps {
  text?: string;
  /** Optional alias allowing callers to use `content` instead of `text` */
  content?: string;
  term?: string;
  context?: string;
  children?: React.ReactNode;
  iconSize?: number;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function InfoTooltip({ 
  text,
  content,
  term, 
  context, 
  children, 
  iconSize = 16, 
  iconClassName = 'text-muted-foreground',
  side = 'top',
  align = 'center',
  className
}: InfoTooltipProps) {
  const [explanation, setExplanation] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  
  const handleMouseEnter = React.useCallback(async () => {
    if (term && !explanation && !loading) {
      setLoading(true)
      try {
        const result = await getExplanation(term, context)
        setExplanation(result)
      } catch (error) {
        console.error("Failed to fetch explanation:", error)
        setExplanation("Unable to load explanation")
      } finally {
        setLoading(false)
      }
    }
  }, [explanation, loading, term, context])

  // Determine what should be shown inside the tooltip. Priority:
  // 1. Explicit `content` prop
  // 2. Simple `text` prop
  // 3. Dynamic explanation loading state / term fallback
  const tooltipContent = content ?? text ?? (loading ? "Loading..." : explanation ?? term ?? "")

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild onMouseEnter={handleMouseEnter}>
          {children ? (
            <span className="cursor-help border-b border-dotted border-gray-400">
              {children}
            </span>
          ) : (
            <span className={`cursor-help inline-flex items-center ${iconClassName} ${className || ''}`}>
              <Info size={iconSize} />
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p className="max-w-xs text-sm">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default InfoTooltip;
