"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CorrelationChart } from "./CorrelationChart";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X } from "lucide-react";

const MAX_INSTRUMENTS = 5;

export function CorrelationsTabWithChartOnly() {
  const { toast } = useToast();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
  
  // Handle selecting an instrument from watchlist - SIMPLIFIED VERSION
  const handleSelectInstrument = useCallback((watchlistItem: any) => {
    console.log("handleSelectInstrument called with:", watchlistItem);
    
    try {
      // Basic validation
      if (!watchlistItem?.id) {
        console.error("Missing watchlistItem.id");
        toast({
          title: "Error",
          description: "Invalid instrument data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if already selected
      if (selectedInstruments.find(i => i.id === watchlistItem.id)) {
        console.log("Instrument already selected");
        toast({
          title: "Already Selected",
          description: "This instrument is already selected for correlation analysis.",
          variant: "destructive",
        });
        return;
      }
      
      // Check max limit
      if (selectedInstruments.length >= MAX_INSTRUMENTS) {
        console.log("Max instruments reached");
        toast({
          title: "Maximum Reached",
          description: `You can select up to ${MAX_INSTRUMENTS} instruments for correlation analysis.`,
          variant: "destructive",
        });
        return;
      }
      
      // MINIMAL INSTRUMENT OBJECT with color
      const instrumentWithMinimalData = { 
        id: watchlistItem.id,
        symbol: watchlistItem.symbol || "UNKNOWN",
        exchange: watchlistItem.exchange || "UNKNOWN",
        contract_type: watchlistItem.contract_type || "derivatives",
        // Fixed color assignment
        color: ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c"][selectedInstruments.length % 5]
      };
      
      console.log("Adding instrument:", instrumentWithMinimalData);
      
      setSelectedInstruments(prev => {
        const newInstruments = [...prev, instrumentWithMinimalData];
        console.log("New selectedInstruments:", newInstruments);
        return newInstruments;
      });
      
      toast({
        title: "Instrument Added",
        description: `${watchlistItem.symbol} has been added to correlation analysis.`,
      });
      
    } catch (error) {
      console.error("Error in handleSelectInstrument:", error);
      toast({
        title: "Error",
        description: "Failed to add instrument to correlation analysis. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedInstruments, toast]);
  
  // Handle removing an instrument
  const handleRemoveInstrument = useCallback((instrumentId: string) => {
    console.log("handleRemoveInstrument called with:", instrumentId);
    
    try {
      setSelectedInstruments(prev => {
        const newInstruments = prev.filter(i => i.id !== instrumentId);
        console.log("After removal, selectedInstruments:", newInstruments);
        return newInstruments;
      });
      
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
  }, [toast]);

  console.log("Component render - selectedInstruments:", selectedInstruments);

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
        
        {/* Right Panel - Chart (NO useEffect, just static data) */}
        <div className="w-full lg:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis (Chart Test)</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pass empty/static data to chart to test if chart component itself causes crash */}
              <CorrelationChart 
                data={[]} // Empty data - no useEffect involved
                instruments={selectedInstruments}
                correlationScore={undefined}
              />
              
              <div className="mt-4 text-sm">
                <p className="font-medium">Chart Test:</p>
                <p className="mt-1 text-muted-foreground">
                  Testing if CorrelationChart component itself causes the crash.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
