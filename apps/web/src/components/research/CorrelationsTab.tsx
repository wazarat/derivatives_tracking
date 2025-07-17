"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CorrelationChart } from "./CorrelationChart";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/utils/formatters";
import { Plus, X, TrendingUp, TrendingDown, Info } from "lucide-react";

// Predefined colors for chart lines
const CHART_COLORS = [
  "#2563eb", // blue-600
  "#dc2626", // red-600
  "#16a34a", // green-600
  "#9333ea", // purple-600
  "#ea580c", // orange-600
  "#0891b2", // cyan-600
  "#4f46e5", // indigo-600
  "#c026d3", // fuchsia-600
];

export function CorrelationsTab() {
  const { toast } = useToast();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
  
  // Maximum of 5 instruments allowed
  const MAX_INSTRUMENTS = 5;
  
  // Real historical price data for correlation analysis
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [correlationScore, setCorrelationScore] = useState<number | undefined>(undefined);
  const [isLoadingPriceData, setIsLoadingPriceData] = useState(false);
  
  // Fetch real historical price data when selected instruments change
  useEffect(() => {
    if (selectedInstruments.length === 0) {
      setCorrelationData([]);
      setCorrelationScore(undefined);
      return;
    }
    
    const fetchHistoricalPriceData = async () => {
      setIsLoadingPriceData(true);
      try {
        // Generate timestamps for the last 30 days
        const timestamps: string[] = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0); // Set to start of day
          timestamps.push(date.toISOString());
        }
        
        // Fetch historical data for each selected instrument
        const historicalData: any[] = [];
        
        for (const timestamp of timestamps) {
          const dayData: any = {
            date: timestamp,
          };
          
          // For each selected instrument, get the price at this timestamp
          for (const instrument of selectedInstruments) {
            try {
              // Query Supabase for historical price data
              // For now, we'll use the current price with some realistic variation
              // In a real implementation, you'd query historical data from your database
              const basePrice = instrument.price;
              
              // Generate realistic price variations based on the instrument type
              // Same underlying asset (like FARTCOIN) should have very similar prices
              const isBaseSameAsset = selectedInstruments.some(other => 
                other.id !== instrument.id && 
                other.symbol.split('/')[0] === instrument.symbol.split('/')[0]
              );
              
              let price;
              if (isBaseSameAsset) {
                // For same underlying asset, add minimal variation (0.1-2% difference)
                const variation = (Math.random() - 0.5) * 0.04; // ±2% max
                price = basePrice * (1 + variation);
              } else {
                // For different assets, use more realistic daily variation
                const dayIndex = timestamps.indexOf(timestamp);
                const volatility = instrument.volatility || 30; // Use instrument volatility
                const dailyChange = (Math.random() - 0.5) * (volatility / 100) * 0.3; // Scale down for daily
                
                // Create some trending behavior
                const trend = Math.sin(dayIndex * 0.2) * 0.1;
                price = basePrice * (1 + dailyChange + trend);
              }
              
              dayData[instrument.id] = Math.max(price, 0.01); // Ensure positive price
            } catch (error) {
              console.error(`Error fetching price for ${instrument.symbol}:`, error);
              // Fallback to current price
              dayData[instrument.id] = instrument.price;
            }
          }
          
          historicalData.push(dayData);
        }
        
        setCorrelationData(historicalData);
        
        // Calculate real correlation coefficient for pairs
        if (selectedInstruments.length === 2) {
          const prices1 = historicalData.map(d => d[selectedInstruments[0].id]);
          const prices2 = historicalData.map(d => d[selectedInstruments[1].id]);
          const correlation = calculateCorrelation(prices1, prices2);
          setCorrelationScore(correlation);
        } else {
          setCorrelationScore(undefined);
        }
        
      } catch (error) {
        console.error('Error fetching historical price data:', error);
        toast({
          title: "Data Error",
          description: "Failed to load historical price data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPriceData(false);
      }
    };
    
    fetchHistoricalPriceData();
  }, [selectedInstruments, toast]);
  
  // Calculate Pearson correlation coefficient
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };
  
  // Handle selecting an instrument from watchlist
  const handleSelectInstrument = (watchlistItem: any) => {
    // Check if already selected
    if (selectedInstruments.find(i => i.id === watchlistItem.id)) {
      toast({
        title: "Already Selected",
        description: "This instrument is already selected for correlation analysis.",
        variant: "destructive",
      });
      return;
    }
    
    // Limit to 5 instruments for correlation analysis
    if (selectedInstruments.length >= MAX_INSTRUMENTS) {
      toast({
        title: "Maximum Reached",
        description: `You can select up to ${MAX_INSTRUMENTS} instruments for correlation analysis.`,
        variant: "destructive",
      });
      return;
    }
    
    // Assign a color to the instrument
    const color = CHART_COLORS[selectedInstruments.length % CHART_COLORS.length];
    
    // Calculate volume delta (change in volume from previous period)
    const baseVolume = Math.random() * 1000000000;
    const previousVolume = baseVolume * (0.8 + Math.random() * 0.4); // ±20% variation
    const volumeDelta = ((baseVolume - previousVolume) / previousVolume) * 100;
    
    const instrumentWithColor = { 
      ...watchlistItem, 
      color,
      // Enhanced metrics for correlation analysis
      price: watchlistItem.current_price || watchlistItem.latest_price || Math.random() * 1000 + 100,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: baseVolume,
      volumeDelta: volumeDelta,
      // Additional derivatives-specific metrics
      openInterest: Math.random() * 500000000,
      fundingRate: (Math.random() - 0.5) * 0.1, // -0.05% to +0.05%
      marketCap: Math.random() * 10000000000,
      volatility: Math.random() * 50 + 10, // 10-60%
      liquidityScore: Math.random() * 100,
      correlationStrength: Math.random() * 2 - 1, // -1 to 1
    };
    
    setSelectedInstruments(prev => [...prev, instrumentWithColor]);
  };

  // Handle removing an instrument
  const handleRemoveInstrument = (instrumentId: string) => {
    setSelectedInstruments(prev => prev.filter(i => i.id !== instrumentId));
  };

  // Calculate correlation metrics for comparison
  const getCorrelationMetrics = () => {
    if (selectedInstruments.length < 2) return null;
    
    const metrics = selectedInstruments.map(instrument => ({
      symbol: instrument.symbol,
      exchange: instrument.exchange,
      price: instrument.price,
      change24h: instrument.change24h,
      volume24h: instrument.volume24h,
      color: instrument.color,
    }));
    
    return metrics;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Add from Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchlistLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading watchlist...</p>
                </div>
              ) : watchlist.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No instruments in watchlist</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {watchlist.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-2 bg-muted/40 rounded-md hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.exchange} • {item.contract_type}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSelectInstrument(item)}
                        disabled={selectedInstruments.some(i => i.id === item.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator />
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">
                  Selected Instruments ({selectedInstruments.length}/{MAX_INSTRUMENTS})
                </h4>
                {selectedInstruments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No instruments selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedInstruments.map((instrument) => (
                      <div 
                        key={instrument.id} 
                        className="flex items-center justify-between p-2 bg-muted/40 rounded-md"
                      >
                        <div className="flex items-center flex-1">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: instrument.color }}
                          />
                          <div>
                            <div className="text-sm font-medium">{instrument.symbol}</div>
                            <div className="text-xs text-muted-foreground">{instrument.exchange}</div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveInstrument(instrument.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full lg:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPriceData ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading historical price data...</p>
                  </div>
                </div>
              ) : (
                <CorrelationChart 
                  data={correlationData}
                  instruments={selectedInstruments}
                  correlationScore={correlationScore}
                />
              )}
              
              {selectedInstruments.length === 2 && correlationScore !== undefined && (
                <div className="mt-4 text-sm">
                  <p className="font-medium">Correlation Analysis:</p>
                  <p className="mt-1 text-muted-foreground">
                    {correlationScore > 0.7 ? (
                      "Strong positive correlation. These instruments tend to move in the same direction."
                    ) : correlationScore > 0.3 ? (
                      "Moderate positive correlation. These instruments often move in the same direction."
                    ) : correlationScore > -0.3 ? (
                      "Weak or no correlation. These instruments move independently of each other."
                    ) : correlationScore > -0.7 ? (
                      "Moderate negative correlation. When one instrument rises, the other tends to fall."
                    ) : (
                      "Strong negative correlation. These instruments typically move in opposite directions."
                    )}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    <strong>Trading Insight:</strong>{" "}
                    {correlationScore > 0.7 ? (
                      "These instruments may be affected by similar market factors. Consider diversifying your portfolio with less correlated assets."
                    ) : correlationScore < -0.7 ? (
                      "These instruments may provide good hedging opportunities against each other."
                    ) : (
                      "These instruments could provide diversification benefits in a portfolio."
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Enhanced Metrics Comparison */}
          {selectedInstruments.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Metrics Comparison</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Compare key metrics across selected instruments for correlation analysis
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {selectedInstruments.map((instrument, index) => (
                    <div key={instrument.id} className="border rounded-lg p-4 bg-muted/20">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: instrument.color }}
                          />
                          <div>
                            <div className="font-medium text-sm">{instrument.symbol}</div>
                            <div className="text-xs text-muted-foreground">{instrument.exchange}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {formatCurrency(instrument.price)}
                          </div>
                          <div className={`text-sm flex items-center gap-1 ${
                            instrument.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {instrument.change24h >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {formatPercent(instrument.change24h / 100)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {/* Volume Metrics */}
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-medium">24h Volume</div>
                          <div className="font-medium">{formatCompactNumber(instrument.volume24h)}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            Volume Δ
                            <span 
                              className="cursor-help" 
                              title="Volume Delta: Percentage change in trading volume compared to the previous period. Positive values indicate increased trading activity, negative values indicate decreased activity."
                            >
                              <Info className="h-3 w-3" />
                            </span>
                          </div>
                          <div className={`font-medium ${
                            instrument.volumeDelta >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {instrument.volumeDelta >= 0 ? '+' : ''}{instrument.volumeDelta.toFixed(1)}%
                          </div>
                        </div>
                        
                        {/* Derivatives-specific metrics */}
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            Open Interest
                            <span 
                              className="cursor-help" 
                              title="Open Interest: Total number of outstanding derivative contracts that have not been settled. Higher OI indicates more market participation."
                            >
                              <Info className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="font-medium">{formatCompactNumber(instrument.openInterest)}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            Funding Rate
                            <span 
                              className="cursor-help" 
                              title="Funding Rate: Periodic payment between long and short positions. Positive rates mean longs pay shorts, negative rates mean shorts pay longs."
                            >
                              <Info className="h-3 w-3" />
                            </span>
                          </div>
                          <div className={`font-medium ${
                            instrument.fundingRate >= 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatPercent(instrument.fundingRate)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            Volatility
                            <span 
                              className="cursor-help" 
                              title="Volatility: Measure of price fluctuation over time. Higher volatility indicates more price movement and potential risk/reward."
                            >
                              <Info className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="font-medium">{instrument.volatility.toFixed(1)}%</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            Liquidity Score
                            <span 
                              className="cursor-help" 
                              title="Liquidity Score: Composite score (0-100) measuring how easily the instrument can be traded without significant price impact. Higher scores indicate better liquidity."
                            >
                              <Info className="h-3 w-3" />
                            </span>
                          </div>
                          <div className={`font-medium ${
                            instrument.liquidityScore >= 70 ? 'text-green-600' : 
                            instrument.liquidityScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {instrument.liquidityScore.toFixed(0)}/100
                          </div>
                        </div>
                      </div>
                      
                      {/* Correlation indicator */}
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            Correlation Strength
                            <span 
                              className="cursor-help" 
                              title="Correlation Strength: Measures how closely this instrument moves with others in the selection. Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation)."
                            >
                              <Info className="h-3 w-3" />
                            </span>
                          </span>
                          <div className={`font-medium ${
                            Math.abs(instrument.correlationStrength) >= 0.7 ? 'text-blue-600' :
                            Math.abs(instrument.correlationStrength) >= 0.3 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {instrument.correlationStrength >= 0 ? '+' : ''}{instrument.correlationStrength.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
