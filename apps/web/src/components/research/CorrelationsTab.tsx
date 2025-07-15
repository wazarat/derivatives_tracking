"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CorrelationChart } from "./CorrelationChart";
import { useFuturesInstruments, usePerpetualInstruments, useDexPerpInstruments } from "@/hooks/useInstruments";
import { AddTradeModal, AddTradeFormData } from "./AddTradeModal";
import { addToWatchlist, addToPortfolio } from "@/services/watchlistService";
import { useToast } from "@/components/ui/use-toast";

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
  const [selectedSector, setSelectedSector] = useState<string>("cex-futures");
  const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  
  // Fetch instruments based on selected sector
  const futuresQuery = useFuturesInstruments();
  const perpsQuery = usePerpetualInstruments();
  const dexPerpsQuery = useDexPerpInstruments();
  
  // Get the appropriate query based on selected sector
  const getActiveQuery = () => {
    switch (selectedSector) {
      case "cex-futures":
        return futuresQuery;
      case "cex-perps":
        return perpsQuery;
      case "dex-perps":
        return dexPerpsQuery;
      default:
        return futuresQuery;
    }
  };
  
  const activeQuery = getActiveQuery();
  const instruments = activeQuery.data || [];
  
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
    const mockData = [];
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
  
  // Handle selecting an instrument
  const handleSelectInstrument = (instrumentId: string) => {
    const instrument = instruments.find(i => i.id === instrumentId);
    if (!instrument) return;
    
    // Check if already selected
    if (selectedInstruments.some(i => i.id === instrumentId)) {
      toast({
        title: "Instrument already selected",
        description: "This instrument is already in your correlation chart.",
      });
      return;
    }
    
    // Limit to 2 instruments for correlation analysis
    if (selectedInstruments.length >= 2) {
      toast({
        title: "Maximum instruments reached",
        description: "You can only compare up to 2 instruments at a time.",
      });
      return;
    }
    
    // Add instrument with a color
    setSelectedInstruments([
      ...selectedInstruments, 
      {
        ...instrument,
        color: CHART_COLORS[selectedInstruments.length % CHART_COLORS.length]
      }
    ]);
  };
  
  // Handle removing an instrument
  const handleRemoveInstrument = (instrumentId: string) => {
    setSelectedInstruments(selectedInstruments.filter(i => i.id !== instrumentId));
  };
  
  // Handle adding to watchlist/portfolio
  const handleOpenAddModal = (instrument: any) => {
    setSelectedInstrument(instrument);
    setModalOpen(true);
  };
  
  const handleAddToWatchlist = async (data: AddTradeFormData) => {
    try {
      await addToWatchlist(data);
      toast({
        title: "Added to Watchlist",
        description: `${data.instrumentSymbol} has been added to your watchlist.`,
      });
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddToPortfolio = async (data: AddTradeFormData) => {
    try {
      await addToPortfolio(data);
      toast({
        title: "Added to Portfolio",
        description: `${data.instrumentSymbol} position has been added to your portfolio.`,
      });
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to add to portfolio. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Select Instruments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sector">Sector</Label>
                <Select
                  value={selectedSector}
                  onValueChange={setSelectedSector}
                >
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cex-futures">CEX Futures</SelectItem>
                    <SelectItem value="cex-perps">CEX Perpetuals</SelectItem>
                    <SelectItem value="dex-perps">DEX Perpetuals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="instrument">Instrument</Label>
                <Select
                  disabled={activeQuery.isLoading || !instruments.length}
                  onValueChange={handleSelectInstrument}
                >
                  <SelectTrigger id="instrument">
                    <SelectValue placeholder={
                      activeQuery.isLoading 
                        ? "Loading..." 
                        : instruments.length 
                          ? "Select instrument" 
                          : "No instruments available"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {instruments.map((instrument) => (
                      <SelectItem key={instrument.id} value={instrument.id}>
                        {instrument.symbol} ({instrument.venue})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Selected Instruments</h4>
                {selectedInstruments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No instruments selected
                  </p>
                ) : (
                  <div className="space-y-2">
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
                          <span className="text-sm font-medium">
                            {instrument.symbol}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenAddModal(instrument)}
                          >
                            Add
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveInstrument(instrument.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
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
        </div>
      </div>
      
      <AddTradeModal
        instrument={selectedInstrument}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddToWatchlist={handleAddToWatchlist}
        onAddToPortfolio={handleAddToPortfolio}
      />
    </div>
  );
}
