'use client';

import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { usePortfolio } from '@/hooks/usePortfolio';

interface AddTradeDialogProps {
  trigger?: React.ReactNode;
  prefilledData?: {
    exchange?: string;
    symbol?: string;
    entry_price?: string;
  };
}

export function AddTradeDialog({ trigger, prefilledData }: AddTradeDialogProps) {
  const { addPosition } = usePortfolio();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    exchange: prefilledData?.exchange || '',
    symbol: prefilledData?.symbol || '',
    position_side: 'long' as 'long' | 'short',
    position_size: '',
    entry_price: prefilledData?.entry_price || '',
    stop_loss: '',
    take_profit: '',
    leverage: '1',
    notes: '',
    trade_created_at: new Date().toISOString().slice(0, 16), // For datetime-local input
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.exchange || !formData.symbol || !formData.position_size || !formData.entry_price) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Convert datetime-local to ISO string
      const tradeCreatedAt = new Date(formData.trade_created_at).toISOString();

      await addPosition({
        exchange: formData.exchange,
        symbol: formData.symbol,
        position_side: formData.position_side,
        position_size: parseFloat(formData.position_size),
        entry_price: parseFloat(formData.entry_price),
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : undefined,
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : undefined,
        leverage: parseFloat(formData.leverage),
        notes: formData.notes || undefined,
        trade_created_at: tradeCreatedAt,
      });

      toast({
        title: 'Trade Added',
        description: `Successfully added ${formData.position_side} position for ${formData.symbol}`,
      });

      // Reset form
      setFormData({
        exchange: prefilledData?.exchange || '',
        symbol: prefilledData?.symbol || '',
        position_side: 'long',
        position_size: '',
        entry_price: prefilledData?.entry_price || '',
        stop_loss: '',
        take_profit: '',
        leverage: '1',
        notes: '',
        trade_created_at: new Date().toISOString().slice(0, 16),
      });

      setOpen(false);
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add trade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription>
            Record a new derivatives trade in your portfolio. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exchange">Exchange *</Label>
              <Select value={formData.exchange} onValueChange={(value) => handleInputChange('exchange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binance">Binance</SelectItem>
                  <SelectItem value="okx">OKX</SelectItem>
                  <SelectItem value="bybit">Bybit</SelectItem>
                  <SelectItem value="bitmex">BitMEX</SelectItem>
                  <SelectItem value="deribit">Deribit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., BTCUSDT"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position_side">Position Side *</Label>
              <Select value={formData.position_side} onValueChange={(value: 'long' | 'short') => handleInputChange('position_side', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Long
                    </div>
                  </SelectItem>
                  <SelectItem value="short">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Short
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leverage">Leverage</Label>
              <Input
                id="leverage"
                type="number"
                placeholder="1"
                min="1"
                max="100"
                step="0.1"
                value={formData.leverage}
                onChange={(e) => handleInputChange('leverage', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position_size">Position Size *</Label>
              <Input
                id="position_size"
                type="number"
                placeholder="0.1"
                min="0"
                step="0.00000001"
                value={formData.position_size}
                onChange={(e) => handleInputChange('position_size', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_price">Entry Price *</Label>
              <Input
                id="entry_price"
                type="number"
                placeholder="50000"
                min="0"
                step="0.01"
                value={formData.entry_price}
                onChange={(e) => handleInputChange('entry_price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stop_loss">Stop Loss</Label>
              <Input
                id="stop_loss"
                type="number"
                placeholder="Optional"
                min="0"
                step="0.01"
                value={formData.stop_loss}
                onChange={(e) => handleInputChange('stop_loss', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="take_profit">Take Profit</Label>
              <Input
                id="take_profit"
                type="number"
                placeholder="Optional"
                min="0"
                step="0.01"
                value={formData.take_profit}
                onChange={(e) => handleInputChange('take_profit', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade_created_at">Trade Created At *</Label>
            <Input
              id="trade_created_at"
              type="datetime-local"
              value={formData.trade_created_at}
              onChange={(e) => handleInputChange('trade_created_at', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this trade..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Trade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
