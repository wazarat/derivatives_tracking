"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/components/ui/use-toast";

export function CorrelationsTabDebug() {
  const { toast } = useToast();
  
  // Test 1: Basic component with hooks
  console.log("CorrelationsTab: Component rendering");
  
  try {
    const { watchlist, loading: watchlistLoading } = useWatchlist();
    console.log("CorrelationsTab: useWatchlist hook successful", { watchlist, watchlistLoading });
    
    const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
    console.log("CorrelationsTab: useState hooks successful");
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Correlations Analysis (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Debug version - testing hooks and basic rendering
              </p>
              
              <div className="space-y-2">
                <p><strong>Watchlist Loading:</strong> {watchlistLoading ? "Yes" : "No"}</p>
                <p><strong>Watchlist Items:</strong> {watchlist?.length || 0}</p>
                <p><strong>Selected Instruments:</strong> {selectedInstruments.length}</p>
              </div>
              
              {watchlist && watchlist.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Watchlist Items:</h4>
                  <ul className="text-sm space-y-1">
                    {watchlist.slice(0, 5).map((item, index) => (
                      <li key={index} className="text-muted-foreground">
                        {item.symbol} ({item.exchange})
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
