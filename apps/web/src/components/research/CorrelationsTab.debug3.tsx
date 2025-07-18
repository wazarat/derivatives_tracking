"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/components/ui/use-toast";

// Test if CorrelationChart import is causing the issue
let CorrelationChart: any;
try {
  const chartModule = require("@/components/research/CorrelationChart");
  CorrelationChart = chartModule.CorrelationChart;
  console.log("CorrelationsTab: CorrelationChart imported successfully");
} catch (error) {
  console.error("CorrelationsTab: Error importing CorrelationChart", error);
  CorrelationChart = null;
}

export function CorrelationsTabDebug3() {
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
    
    // Test adding an instrument
    const handleSelectInstrument = (watchlistItem: any) => {
      console.log("CorrelationsTab: handleSelectInstrument called", watchlistItem);
      
      try {
        if (selectedInstruments.length >= 5) {
          toast({
            title: "Maximum instruments reached",
            description: "You can select up to 5 instruments for correlation analysis.",
            variant: "destructive",
          });
          return;
        }
        
        if (selectedInstruments.some(i => i.id === watchlistItem.id)) {
          return; // Already selected
        }
        
        const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];
        const color = colors[selectedInstruments.length % colors.length];
        
        const instrumentWithColor = { 
          ...watchlistItem, 
          color,
          price: watchlistItem.price || Math.random() * 1000 + 100,
        };
        
        setSelectedInstruments(prev => [...prev, instrumentWithColor]);
        console.log("CorrelationsTab: Instrument added successfully", instrumentWithColor);
        
      } catch (error) {
        console.error("CorrelationsTab: Error in handleSelectInstrument", error);
        toast({
          title: "Error",
          description: "Failed to add instrument to correlation analysis",
          variant: "destructive",
        });
      }
    };
    
    const handleRemoveInstrument = (instrumentId: string) => {
      console.log("CorrelationsTab: handleRemoveInstrument called", instrumentId);
      setSelectedInstruments(prev => prev.filter(i => i.id !== instrumentId));
    };
    
    // Test the useEffect
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
          // Generate simple test data
          const testData = [];
          for (let i = 0; i < 10; i++) {
            const dayData: any = {
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            };
            
            selectedInstruments.forEach(instrument => {
              dayData[instrument.id] = (instrument.price || 100) * (1 + (Math.random() - 0.5) * 0.1);
            });
            
            testData.push(dayData);
          }
          
          console.log("CorrelationsTab: Generated test data", testData.length);
          setCorrelationData(testData);
          
          if (selectedInstruments.length === 2) {
            setCorrelationScore(0.75); // Mock correlation
          }
          
        } catch (error) {
          console.error("CorrelationsTab: Error in fetchHistoricalPriceData", error);
        } finally {
          setIsLoadingPriceData(false);
        }
      };
      
      fetchHistoricalPriceData();
    }, [selectedInstruments, toast]);
    
    console.log("CorrelationsTab: About to render component");
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Select Instruments (Debug 3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Debug version 3 - testing UI interactions and chart rendering
                  </p>
                  
                  <div className="space-y-2">
                    <p><strong>Watchlist Loading:</strong> {watchlistLoading ? "Yes" : "No"}</p>
                    <p><strong>Watchlist Items:</strong> {watchlist?.length || 0}</p>
                    <p><strong>Selected Instruments:</strong> {selectedInstruments.length}</p>
                    <p><strong>Chart Component:</strong> {CorrelationChart ? "Loaded" : "Failed"}</p>
                  </div>
                  
                  {watchlist && watchlist.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {watchlist.slice(0, 3).map((item) => (
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
                  
                  {selectedInstruments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Selected:</h4>
                      <div className="space-y-1">
                        {selectedInstruments.map((instrument) => (
                          <div 
                            key={instrument.id} 
                            className="flex items-center justify-between p-2 bg-muted/40 rounded-md"
                          >
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: instrument.color }}
                              />
                              <span className="text-sm">{instrument.symbol}</span>
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
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full lg:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>Correlation Chart Test</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPriceData ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  </div>
                ) : CorrelationChart ? (
                  <CorrelationChart 
                    data={correlationData}
                    instruments={selectedInstruments}
                    correlationScore={correlationScore}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 border rounded-md bg-red-50">
                    <p className="text-red-600">CorrelationChart component failed to load</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
