"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export function CorrelationsTabIncremental() {
  const { toast } = useToast();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
  
  const MAX_INSTRUMENTS = 5;
  
  // Handle selecting an instrument from watchlist - INCREMENTAL VERSION
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
      
      // STEP 1: Add back the metrics extraction logic (this might be causing the crash)
      console.log("Starting metrics extraction...");
      
      // Calculate volume delta (change in volume from previous period)
      const baseVolume = Math.random() * 1000000000;
      const previousVolume = baseVolume * (0.8 + Math.random() * 0.4); // ±20% variation
      const volumeDelta = ((baseVolume - previousVolume) / previousVolume) * 100;
      
      console.log("Volume delta calculated:", volumeDelta);
      
      // STEP 2: Add back the price extraction logic (this might be causing the crash)
      console.log("Starting price extraction...");
      
      // Safely extract price from various possible properties
      const extractPrice = (item: any): number => {
        console.log("Extracting price from item:", item);
        
        const possiblePrices = [
          item.current_price,
          item.latest_price,
          item.price,
          item.index_price
        ];
        
        for (const price of possiblePrices) {
          if (typeof price === 'number' && price > 0) {
            console.log("Found valid price:", price);
            return price;
          }
        }
        
        console.log("No valid price found, using fallback");
        // Fallback to random price if no valid price found
        return Math.random() * 1000 + 100;
      };
      
      // STEP 3: Add back the volume extraction logic (this might be causing the crash)
      console.log("Starting volume extraction...");
      
      // Safely extract volume
      const extractVolume = (item: any): number => {
        console.log("Extracting volume from item:", item);
        
        const possibleVolumes = [
          item.volume_24h,
          item.volume24h,
          item.vol24h
        ];
        
        for (const volume of possibleVolumes) {
          if (typeof volume === 'number' && volume > 0) {
            console.log("Found valid volume:", volume);
            return volume;
          }
        }
        
        console.log("No valid volume found, using fallback");
        return baseVolume; // Use calculated base volume as fallback
      };
      
      console.log("Creating instrument with enhanced metrics...");
      
      // STEP 4: Create the enhanced instrument object (this might be causing the crash)
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
      
      console.log("Enhanced instrument created:", instrumentWithColor);
      
      // STEP 5: Add to state
      console.log("Adding to state...");
      setSelectedInstruments(prev => [...prev, instrumentWithColor]);
      
      console.log("Showing success toast...");
      toast({
        title: "Instrument Added",
        description: `${watchlistItem.symbol} has been added to correlation analysis.`,
      });
      
      console.log("handleSelectInstrument completed successfully");
      
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
                Select Instruments (Incremental Test)
                <Badge variant="secondary">{selectedInstruments.length}/{MAX_INSTRUMENTS}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Testing with enhanced metrics extraction
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
        
        {/* Right Panel - Metrics Display */}
        <div className="w-full lg:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Instruments with Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInstruments.length === 0 ? (
                <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">
                    Select instruments to view metrics
                  </p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
