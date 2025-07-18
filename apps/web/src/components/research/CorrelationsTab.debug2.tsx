"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/components/ui/use-toast";

export function CorrelationsTabDebug2() {
  const { toast } = useToast();
  
  console.log("CorrelationsTab: Component rendering");
  
  try {
    const { watchlist, loading: watchlistLoading } = useWatchlist();
    console.log("CorrelationsTab: useWatchlist hook successful", { watchlist, watchlistLoading });
    
    const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
    const [correlationData, setCorrelationData] = useState<any[]>([]);
    const [correlationScore, setCorrelationScore] = useState<number | undefined>(undefined);
    const [isLoadingPriceData, setIsLoadingPriceData] = useState(false);
    
    console.log("CorrelationsTab: useState hooks successful");
    
    // Test the useEffect that might be causing the crash
    useEffect(() => {
      console.log("CorrelationsTab: useEffect triggered", { selectedInstruments: selectedInstruments.length });
      
      if (selectedInstruments.length === 0) {
        setCorrelationData([]);
        setCorrelationScore(undefined);
        return;
      }
      
      const fetchHistoricalPriceData = async () => {
        console.log("CorrelationsTab: Starting fetchHistoricalPriceData");
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
          
          console.log("CorrelationsTab: Generated timestamps", timestamps.length);
          
          // Generate historical data for each selected instrument
          const historicalData: any[] = [];
          
          for (const timestamp of timestamps) {
            const dayData: any = {
              date: timestamp,
            };
            
            // For each selected instrument, get the price at this timestamp
            for (const instrument of selectedInstruments) {
              try {
                const basePrice = instrument.price || 100; // Fallback price
                
                // Generate realistic price variations
                const variation = (Math.random() - 0.5) * 0.04; // ±2% max
                const price = basePrice * (1 + variation);
                
                dayData[instrument.id] = price;
                
              } catch (error) {
                console.error("CorrelationsTab: Error processing instrument", instrument, error);
                dayData[instrument.id] = instrument.price || 100;
              }
            }
            
            historicalData.push(dayData);
          }
          
          console.log("CorrelationsTab: Generated historical data", historicalData.length);
          setCorrelationData(historicalData);
          
          // Calculate correlation if we have exactly 2 instruments
          if (selectedInstruments.length === 2) {
            const instrument1Data = historicalData.map(d => d[selectedInstruments[0].id]);
            const instrument2Data = historicalData.map(d => d[selectedInstruments[1].id]);
            
            // Simple correlation calculation
            const correlation = calculateCorrelation(instrument1Data, instrument2Data);
            setCorrelationScore(correlation);
          } else {
            setCorrelationScore(undefined);
          }
          
        } catch (error) {
          console.error("CorrelationsTab: Error in fetchHistoricalPriceData", error);
          toast({
            title: "Error",
            description: "Failed to load price data for correlation analysis",
            variant: "destructive",
          });
        } finally {
          setIsLoadingPriceData(false);
        }
      };
      
      fetchHistoricalPriceData();
    }, [selectedInstruments, toast]);
    
    // Simple correlation calculation function
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
    
    console.log("CorrelationsTab: Component rendered successfully");
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Correlations Analysis (Debug 2)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Debug version 2 - testing useEffect and price data generation
              </p>
              
              <div className="space-y-2">
                <p><strong>Watchlist Loading:</strong> {watchlistLoading ? "Yes" : "No"}</p>
                <p><strong>Watchlist Items:</strong> {watchlist?.length || 0}</p>
                <p><strong>Selected Instruments:</strong> {selectedInstruments.length}</p>
                <p><strong>Correlation Data Points:</strong> {correlationData.length}</p>
                <p><strong>Loading Price Data:</strong> {isLoadingPriceData ? "Yes" : "No"}</p>
                <p><strong>Correlation Score:</strong> {correlationScore?.toFixed(3) || "N/A"}</p>
              </div>
              
              {watchlist && watchlist.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Watchlist Items:</h4>
                  <ul className="text-sm space-y-1">
                    {watchlist.slice(0, 5).map((item, index) => (
                      <li key={index} className="text-muted-foreground">
                        {item.symbol} ({item.exchange}) - Price: {item.price || "N/A"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("CorrelationsTab: Error in component", error);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Correlations Analysis (Error)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">
              <p>Error in CorrelationsTab component:</p>
              <pre className="text-xs mt-2 bg-red-50 p-2 rounded">
                {error instanceof Error ? error.message : String(error)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
