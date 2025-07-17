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
  
  // Mock correlation data (in a real app, this would be fetched from an API)
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [correlationScore, setCorrelationScore] = useState<number | undefined>(undefined);
  
  // Generate mock price history data when selected instruments change
  useEffect(() => {
    if (selectedInstruments.length === 0) {
      setCorrelationData([]);
      setCorrelationScore(undefined);
      return;
    }
    
    // Generate 30 days of mock price data
    const mockData: any[] = [];
    const today = new Date();
    let basePrice = 1000;
    let secondBasePrice = 1200;
    
    // Correlation coefficient between -1 and 1
    const correlation = selectedInstruments.length === 2 ? (Math.random() * 2 - 1) : undefined;
    setCorrelationScore(correlation);
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create price movements with some randomness
      const dayData: any = {
        date: date.toISOString(),
      };
      
      // First instrument follows a random walk
      const change1 = (Math.random() - 0.5) * 20;
      basePrice += change1;
      
      // Second instrument follows first with correlation
      let change2;
      if (correlation !== undefined) {
        // Apply correlation to the change
        change2 = correlation * change1 + (1 - Math.abs(correlation)) * (Math.random() - 0.5) * 20;
      } else {
        change2 = (Math.random() - 0.5) * 20;
      }
      secondBasePrice += change2;
      
      // Add prices for selected instruments
      selectedInstruments.forEach((instrument, index) => {
        if (index === 0) {
          dayData[instrument.id] = basePrice;
        } else if (index === 1) {
          dayData[instrument.id] = secondBasePrice;
        } else {
          // For any additional instruments, generate random prices
          dayData[instrument.id] = 800 + Math.random() * 400;
        }
      });
      
      mockData.push(dayData);
    }
    
    setCorrelationData(mockData);
  }, [selectedInstruments]);
  
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
    const instrumentWithColor = { 
      ...watchlistItem, 
      color,
      // Mock some additional data for correlation analysis
      price: watchlistItem.latest_price || Math.random() * 1000 + 100,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 1000000000,
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
              <CorrelationChart 
                data={correlationData}
                instruments={selectedInstruments}
                correlationScore={correlationScore}
              />
              
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
          
          {/* Metrics Comparison */}
          {selectedInstruments.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedInstruments.map((instrument, index) => (
                    <div key={instrument.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
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
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {formatCurrency(instrument.price)}
                        </div>
                        <div className={`text-xs flex items-center gap-1 ${
                          instrument.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {instrument.change24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercent(instrument.change24h / 100)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vol: {formatCompactNumber(instrument.volume24h)}
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
