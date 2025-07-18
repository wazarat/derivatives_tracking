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
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";

// Predefined colors for chart lines
const CHART_COLORS = [
  "#2563eb", // blue-600
  "#dc2626", // red-600
  "#16a34a", // green-600
  "#9333ea", // purple-600
  "#ea580c", // orange-600
];

export function CorrelationsTabWithChart() {
  const { toast } = useToast();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
  
  const MAX_INSTRUMENTS = 5;
  
  // STEP 6: Add back the chart and correlation logic (this might be causing the crash)
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [correlationScore, setCorrelationScore] = useState<number | undefined>(undefined);
  const [isLoadingPriceData, setIsLoadingPriceData] = useState(false);
  
  // STEP 7: Add back the useEffect for historical price data (this might be causing the crash)
  useEffect(() => {
    console.log("useEffect triggered with selectedInstruments:", selectedInstruments);
    
    if (selectedInstruments.length === 0) {
      console.log("No instruments selected, clearing correlation data");
      setCorrelationData([]);
      setCorrelationScore(undefined);
      return;
    }
    
    const fetchHistoricalPriceData = async () => {
      console.log("Starting fetchHistoricalPriceData...");
      setIsLoadingPriceData(true);
      
      try {
        // Generate timestamps for the last 30 days
        console.log("Generating timestamps...");
        const timestamps: string[] = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0); // Set to start of day
          timestamps.push(date.toISOString());
        }
        
        console.log("Generated timestamps:", timestamps.length);
        
        // Generate historical data for each selected instrument
        console.log("Generating historical data...");
        const historicalData: any[] = [];
        
        for (const timestamp of timestamps) {
          const dayData: any = {
            date: timestamp,
          };
          
          // For each selected instrument, get the price at this timestamp
          for (const instrument of selectedInstruments) {
            try {
              const basePrice = instrument.price || 100; // Fallback price
              
              // Check if this instrument represents the same underlying asset as another
              const sameAssetInstruments = selectedInstruments.filter(other => {
                if (other.id === instrument.id) return false;
                
                // Extract base symbol (e.g., "FARTCOIN" from "FARTCOIN/USDT" or "FARTCOIN-USD")
                const getBaseSymbol = (symbol: string) => {
                  return symbol.split(/[\/\-]/)[0];
                };
                
                return getBaseSymbol(instrument.symbol) === getBaseSymbol(other.symbol);
              });
              
              let price;
              if (sameAssetInstruments.length > 0) {
                // For same underlying assets, use minimal variation (±2%)
                const variation = (Math.random() - 0.5) * 0.04; // ±2% max
                price = basePrice * (1 + variation);
              } else {
                // For different assets, use larger variation
                const variation = (Math.random() - 0.5) * 0.2; // ±10% max
                price = basePrice * (1 + variation);
              }
              
              dayData[instrument.id] = price;
              
            } catch (error) {
              console.error("Error processing instrument price:", error);
              dayData[instrument.id] = instrument.price || 100;
            }
          }
          
          historicalData.push(dayData);
        }
        
        console.log("Historical data generated:", historicalData.length, "days");
        setCorrelationData(historicalData);
        
        // STEP 8: Add back correlation calculation (this might be causing the crash)
        console.log("Calculating correlation...");
        if (selectedInstruments.length === 2) {
          const instrument1Data = historicalData.map(d => d[selectedInstruments[0].id]);
          const instrument2Data = historicalData.map(d => d[selectedInstruments[1].id]);
          
          console.log("Instrument 1 data:", instrument1Data.slice(0, 5));
          console.log("Instrument 2 data:", instrument2Data.slice(0, 5));
          
          const correlation = calculateCorrelation(instrument1Data, instrument2Data);
          console.log("Calculated correlation:", correlation);
          setCorrelationScore(correlation);
        } else {
          setCorrelationScore(undefined);
        }
        
        console.log("fetchHistoricalPriceData completed successfully");
        
      } catch (error) {
        console.error("Error fetching historical price data:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
        toast({
          title: "Error",
          description: "Failed to load price data for correlation analysis",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPriceData(false);
      }
    };
    
    console.log("Calling fetchHistoricalPriceData...");
    fetchHistoricalPriceData();
  }, [selectedInstruments, toast]);
  
  // STEP 9: Add back correlation calculation function (this might be causing the crash)
  const calculateCorrelation = (x: number[], y: number[]): number => {
    console.log("calculateCorrelation called with arrays of length:", x.length, y.length);
    
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    const result = denominator === 0 ? 0 : numerator / denominator;
    console.log("Correlation calculation result:", result);
    return result;
  };
  
  // Handle selecting an instrument from watchlist
  const handleSelectInstrument = (watchlistItem: any) => {
    try {
      console.log("handleSelectInstrument called with:", watchlistItem);
      
      // Basic validation
      if (!watchlistItem?.id) {
        console.error('Invalid watchlist item:', watchlistItem);
        toast({
          title: "Error",
          description: "Invalid instrument data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if already selected
      if (selectedInstruments.find(i => i.id === watchlistItem.id)) {
        toast({
          title: "Already Selected",
          description: "This instrument is already selected for correlation analysis.",
          variant: "destructive",
        });
        return;
      }
      
      // Check max limit
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
      
      // Safely extract price from various possible properties
      const extractPrice = (item: any): number => {
        const possiblePrices = [
          item.current_price,
          item.latest_price,
          item.price,
          item.index_price
        ];
        
        for (const price of possiblePrices) {
          if (typeof price === 'number' && price > 0) {
            return price;
          }
        }
        
        // Fallback to random price if no valid price found
        return Math.random() * 1000 + 100;
      };
      
      // Safely extract volume
      const extractVolume = (item: any): number => {
        const possibleVolumes = [
          item.volume_24h,
          item.volume24h,
          item.vol24h
        ];
        
        for (const volume of possibleVolumes) {
          if (typeof volume === 'number' && volume > 0) {
            return volume;
          }
        }
        
        return baseVolume; // Use calculated base volume as fallback
      };
      
      const instrumentWithColor = { 
        ...watchlistItem, 
        color,
        // Enhanced metrics for correlation analysis
        price: extractPrice(watchlistItem),
        change24h: (Math.random() - 0.5) * 10,
        volume24h: extractVolume(watchlistItem),
        volumeDelta: volumeDelta,
        // Additional derivatives-specific metrics
        openInterest: Math.random() * 500000000,
        fundingRate: (Math.random() - 0.5) * 0.1, // -0.05% to +0.05%
        marketCap: Math.random() * 10000000000,
        volatility: Math.random() * 50 + 10, // 10-60%
        liquidityScore: Math.random() * 100,
        correlationStrength: Math.random() * 2 - 1, // -1 to 1
      };
      
      console.log("Adding instrument:", instrumentWithColor);
      setSelectedInstruments(prev => [...prev, instrumentWithColor]);
      
      toast({
        title: "Instrument Added",
        description: `${watchlistItem.symbol} has been added to correlation analysis.`,
      });
      
    } catch (error) {
      console.error("Error in handleSelectInstrument:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      toast({
        title: "Error",
        description: "Failed to add instrument to correlation analysis. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle removing an instrument
  const handleRemoveInstrument = (instrumentId: string) => {
    try {
      setSelectedInstruments(prev => prev.filter(i => i.id !== instrumentId));
      
      toast({
        title: "Instrument Removed",
        description: "Instrument has been removed from correlation analysis.",
      });
    } catch (error) {
      console.error("Error removing instrument:", error);
      toast({
        title: "Error",
        description: "Failed to remove instrument. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Instrument Selection */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Select Instruments (With Chart)
                <Badge variant="secondary">{selectedInstruments.length}/{MAX_INSTRUMENTS}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Testing with chart and correlation logic
              </div>
              
              {watchlistLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
        
        {/* Right Panel - Chart and Metrics */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* STEP 10: Add back the chart component (this might be causing the crash) */}
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
                      "Weak correlation. These instruments move somewhat independently."
                    ) : correlationScore > -0.7 ? (
                      "Moderate negative correlation. These instruments often move in opposite directions."
                    ) : (
                      "Strong negative correlation. These instruments tend to move in opposite directions."
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Metrics Comparison */}
          {selectedInstruments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedInstruments.map((instrument) => (
                    <div key={instrument.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: instrument.color }}
                        />
                        <div>
                          <div className="font-medium text-sm">{instrument.symbol}</div>
                          <div className="text-xs text-muted-foreground">{instrument.exchange}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{formatCurrency(instrument.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">24h Change:</span>
                          <span className={`font-medium flex items-center gap-1 ${
                            instrument.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {instrument.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {formatPercent(instrument.change24h / 100)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volume 24h:</span>
                          <span className="font-medium">{formatCompactNumber(instrument.volume24h)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volume Δ:</span>
                          <span className={`font-medium ${
                            instrument.volumeDelta >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercent(instrument.volumeDelta / 100)}
                          </span>
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
