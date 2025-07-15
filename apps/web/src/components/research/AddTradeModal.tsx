"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Instrument } from "@/config/columns";
import { useToast } from "@/components/ui/use-toast";

interface AddTradeModalProps {
  instrument?: Instrument;
  isOpen: boolean;
  onClose: () => void;
  onAddToWatchlist: (data: AddTradeFormData) => void;
  onAddToPortfolio: (data: AddTradeFormData) => void;
}

export interface AddTradeFormData {
  instrumentId: string;
  instrumentSymbol: string;
  instrumentName: string;
  venue: string;
  notes: string;
  position?: {
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    leverage?: number;
  };
}

export function AddTradeModal({
  instrument,
  isOpen,
  onClose,
  onAddToWatchlist,
  onAddToPortfolio,
}: AddTradeModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("watchlist");
  
  // Form state
  const [formData, setFormData] = useState<AddTradeFormData>({
    instrumentId: instrument?.id || "",
    instrumentSymbol: instrument?.symbol || "",
    instrumentName: instrument?.name || "",
    venue: instrument?.venue || "",
    notes: "",
    position: activeTab === "portfolio" ? {
      side: 'long',
      size: 1,
      entryPrice: instrument?.price || 0,
      leverage: 1,
    } : undefined,
  });

  // Update form when tab changes
  useEffect(() => {
    if (activeTab === "portfolio" && !formData.position) {
      setFormData(prev => ({
        ...prev,
        position: {
          side: 'long',
          size: 1,
          entryPrice: instrument?.price || 0,
          leverage: 1,
        }
      }));
    }
  }, [activeTab, instrument?.price]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle position field changes
  const handlePositionChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      position: {
        ...prev.position!,
        [field]: field === 'side' ? value : Number(value),
      }
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === "watchlist") {
        onAddToWatchlist(formData);
        toast({
          title: "Added to Watchlist",
          description: `${formData.instrumentSymbol} has been added to your watchlist.`,
        });
      } else {
        onAddToPortfolio(formData);
        toast({
          title: "Added to Portfolio",
          description: `${formData.instrumentSymbol} position has been added to your portfolio.`,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Trade</DialogTitle>
          <DialogDescription>
            Add this instrument to your watchlist or portfolio.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="watchlist" className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="instrumentSymbol">Symbol</Label>
                  <Input
                    id="instrumentSymbol"
                    name="instrumentSymbol"
                    value={formData.instrumentSymbol}
                    onChange={handleInputChange}
                    readOnly={!!instrument}
                    className={instrument ? "bg-muted" : ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    readOnly={!!instrument}
                    className={instrument ? "bg-muted" : ""}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this trade..."
                />
              </div>
            </TabsContent>
            
            <TabsContent value="portfolio" className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="instrumentSymbol">Symbol</Label>
                  <Input
                    id="instrumentSymbol"
                    name="instrumentSymbol"
                    value={formData.instrumentSymbol}
                    onChange={handleInputChange}
                    readOnly={!!instrument}
                    className={instrument ? "bg-muted" : ""}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    readOnly={!!instrument}
                    className={instrument ? "bg-muted" : ""}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="side">Side</Label>
                  <Select
                    value={formData.position?.side}
                    onValueChange={(value) => handlePositionChange('side', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select side" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.position?.size}
                    onChange={(e) => handlePositionChange('size', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entryPrice">Entry Price</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.position?.entryPrice}
                    onChange={(e) => handlePositionChange('entryPrice', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="leverage">Leverage</Label>
                  <Input
                    id="leverage"
                    type="number"
                    min="1"
                    step="0.1"
                    value={formData.position?.leverage}
                    onChange={(e) => handlePositionChange('leverage', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stopLoss">Stop Loss (optional)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.position?.stopLoss || ""}
                    onChange={(e) => handlePositionChange('stopLoss', e.target.value || undefined)}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="takeProfit">Take Profit (optional)</Label>
                  <Input
                    id="takeProfit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.position?.takeProfit || ""}
                    onChange={(e) => handlePositionChange('takeProfit', e.target.value || undefined)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this trade..."
                />
              </div>
            </TabsContent>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {activeTab === "watchlist" ? "Add to Watchlist" : "Add to Portfolio"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
