'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@clerk/nextjs';
import { Star, Plus, Check } from 'lucide-react';

interface AddToWatchlistDialogProps {
  trigger?: React.ReactNode;
  contract: {
    exchange: string;
    symbol: string;
    contract_type: string;
    index_price: number;
  };
}

export function AddToWatchlistDialog({ trigger, contract }: AddToWatchlistDialogProps) {
  const { isSignedIn } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, watchlist } = useWatchlist();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inWatchlist = isInWatchlist(contract.exchange, contract.symbol, contract.contract_type);

  const handleAddToWatchlist = async () => {
    console.log('🔍 [Watchlist Dialog] Button clicked, user signed in:', isSignedIn);
    
    if (!isSignedIn) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add items to your watchlist',
        variant: 'destructive',
      });
      return;
    }

    console.log('🔍 [Watchlist Dialog] Adding contract:', contract);
    setIsLoading(true);
    try {
      if (inWatchlist) {
        // Find the watchlist item to remove
        const item = watchlist.find(w => 
          w.exchange === contract.exchange && 
          w.symbol === contract.symbol && 
          w.contract_type === contract.contract_type
        );
        if (item) {
          await removeFromWatchlist(item.id);
          toast({
            title: 'Removed from Watchlist',
            description: `${contract.symbol} has been removed from your watchlist`,
          });
        }
      } else {
        console.log('🔍 [Watchlist Dialog] Calling addToWatchlist with:', {
          exchange: contract.exchange,
          symbol: contract.symbol,
          contract_type: contract.contract_type,
          starred: false,
        });
        
        await addToWatchlist({
          exchange: contract.exchange,
          symbol: contract.symbol,
          contract_type: contract.contract_type,
          starred: false,
        });
        
        console.log('✅ [Watchlist Dialog] Successfully added to watchlist');
        toast({
          title: 'Added to Watchlist',
          description: `${contract.symbol} has been added to your watchlist`,
        });
      }
      setOpen(false);
    } catch (error) {
      console.error('❌ [Watchlist Dialog] Error updating watchlist:', error);
      console.error('❌ [Watchlist Dialog] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update watchlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="h-8 px-2"
      onClick={() => setOpen(true)}
    >
      {inWatchlist ? (
        <>
          <Check className="h-3 w-3 mr-1" />
          In Watchlist
        </>
      ) : (
        <>
          <Star className="h-3 w-3 mr-1" />
          Add to Watchlist
        </>
      )}
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </DialogTitle>
            <DialogDescription>
              {inWatchlist 
                ? `Remove ${contract.symbol} from your watchlist?`
                : `Add ${contract.symbol} to your watchlist to track its performance?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Symbol:</span>
              <span className="text-sm">{contract.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Exchange:</span>
              <span className="text-sm">{contract.exchange}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm capitalize">{contract.contract_type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Price:</span>
              <span className="text-sm font-mono">
                ${contract.index_price.toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToWatchlist}
              disabled={isLoading}
              className={inWatchlist ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {inWatchlist ? 'Removing...' : 'Adding...'}
                </>
              ) : (
                <>
                  {inWatchlist ? (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Remove from Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
