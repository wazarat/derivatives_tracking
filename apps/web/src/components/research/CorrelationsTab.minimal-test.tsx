"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X } from "lucide-react";

export function CorrelationsTabMinimalTest() {
  const { toast } = useToast();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
  
  const MAX_INSTRUMENTS = 5;
  const CHART_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c"];
  
  // Minimal handleSelectInstrument - just add the item with minimal processing
  const handleSelectInstrument = (watchlistItem: any) => {
    console.log("handleSelectInstrument called with:", watchlistItem);
    
    try {
      // Basic validation
      if (!watchlistItem?.id) {
        console.error("Invalid watchlist item - no ID");
        return;
      }
      
      // Check if already selected
      if (selectedInstruments.some(i => i.id === watchlistItem.id)) {
        console.log("Already selected");
        return;
      }
      
      // Check max limit
      if (selectedInstruments.length >= MAX_INSTRUMENTS) {
        console.log("Max instruments reached");
        return;
      }
      
      // Create minimal instrument object
      const color = CHART_COLORS[selectedInstruments.length % CHART_COLORS.length];
      const instrumentWithColor = {
        id: watchlistItem.id,
        symbol: watchlistItem.symbol || "Unknown",
        exchange: watchlistItem.exchange || "Unknown",
        color: color,
        price: 100, // Fixed price to avoid any price extraction issues
      };
      
      console.log("Adding instrument:", instrumentWithColor);
      
      // Add to state
      setSelectedInstruments(prev => {
        console.log("Previous instruments:", prev);
        const newInstruments = [...prev, instrumentWithColor];
        console.log("New instruments:", newInstruments);
        return newInstruments;
      });
      
      console.log("Instrument added successfully");
      
    } catch (error) {
      console.error("Error in handleSelectInstrument:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    }
  };
  
  const handleRemoveInstrument = (instrumentId: string) => {
    console.log("handleRemoveInstrument called with:", instrumentId);
    setSelectedInstruments(prev => prev.filter(i => i.id !== instrumentId));
  };

  console.log("Component rendering with:", {
    watchlistLoading,
    watchlistLength: watchlist?.length,
    selectedInstrumentsLength: selectedInstruments.length
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Instrument Selection */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Select Instruments (Minimal Test)
                <Badge variant="secondary">{selectedInstruments.length}/{MAX_INSTRUMENTS}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Testing minimal add/remove functionality
                </div>
                
                {watchlistLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : watchlist?.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No instruments in watchlist</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {watchlist?.map((item) => (
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
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">
                      Selected Instruments ({selectedInstruments.length}/{MAX_INSTRUMENTS})
                    </h4>
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Simple Display */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Selected Instruments</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInstruments.length === 0 ? (
                <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">
                    Select instruments to view them here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedInstruments.map((instrument) => (
                    <div key={instrument.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: instrument.color }}
                        />
                        <span className="font-medium">{instrument.symbol}</span>
                        <span className="text-muted-foreground">({instrument.exchange})</span>
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
