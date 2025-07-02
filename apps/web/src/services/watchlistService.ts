import { Asset, AssetSchema } from '@/types/assets';

// Local storage key for watchlist
const WATCHLIST_STORAGE_KEY = 'canhav_watchlist';

/**
 * Get the user's watchlist from local storage
 * @returns Array of asset IDs in the watchlist
 */
export function getWatchlistIds(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!storedWatchlist) return [];
    
    const parsedWatchlist = JSON.parse(storedWatchlist);
    if (!Array.isArray(parsedWatchlist)) return [];
    
    return parsedWatchlist.filter(id => typeof id === 'string');
  } catch (error) {
    console.error('Error getting watchlist from local storage:', error);
    return [];
  }
}

/**
 * Get the full watchlist assets from local storage
 * @returns Array of assets in the watchlist
 */
export function getWatchlistAssets(): Asset[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedWatchlistAssets = localStorage.getItem(`${WATCHLIST_STORAGE_KEY}_assets`);
    if (!storedWatchlistAssets) return [];
    
    const parsedAssets = JSON.parse(storedWatchlistAssets);
    if (!Array.isArray(parsedAssets)) return [];
    
    // Validate each asset with the schema
    return parsedAssets.filter(asset => {
      try {
        return AssetSchema.parse(asset);
      } catch (error) {
        console.error('Invalid asset in watchlist:', asset);
        return false;
      }
    });
  } catch (error) {
    console.error('Error getting watchlist assets from local storage:', error);
    return [];
  }
}

/**
 * Add an asset to the watchlist
 * @param asset Asset to add to watchlist
 */
export function addToWatchlist(asset: Asset): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Get current watchlist
    const currentWatchlistIds = getWatchlistIds();
    const currentWatchlistAssets = getWatchlistAssets();
    
    // Check if asset is already in watchlist
    if (currentWatchlistIds.includes(asset.id)) return;
    
    // Add asset ID to watchlist IDs
    const newWatchlistIds = [...currentWatchlistIds, asset.id];
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlistIds));
    
    // Add asset to watchlist assets
    const newWatchlistAssets = [...currentWatchlistAssets, asset];
    localStorage.setItem(`${WATCHLIST_STORAGE_KEY}_assets`, JSON.stringify(newWatchlistAssets));
  } catch (error) {
    console.error('Error adding asset to watchlist:', error);
  }
}

/**
 * Remove an asset from the watchlist
 * @param assetId ID of asset to remove from watchlist
 */
export function removeFromWatchlist(assetId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Get current watchlist
    const currentWatchlistIds = getWatchlistIds();
    const currentWatchlistAssets = getWatchlistAssets();
    
    // Remove asset ID from watchlist IDs
    const newWatchlistIds = currentWatchlistIds.filter(id => id !== assetId);
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlistIds));
    
    // Remove asset from watchlist assets
    const newWatchlistAssets = currentWatchlistAssets.filter(asset => asset.id !== assetId);
    localStorage.setItem(`${WATCHLIST_STORAGE_KEY}_assets`, JSON.stringify(newWatchlistAssets));
  } catch (error) {
    console.error('Error removing asset from watchlist:', error);
  }
}

/**
 * Check if an asset is in the watchlist
 * @param assetId ID of asset to check
 * @returns True if asset is in watchlist, false otherwise
 */
export function isInWatchlist(assetId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchlistIds = getWatchlistIds();
    return watchlistIds.includes(assetId);
  } catch (error) {
    console.error('Error checking if asset is in watchlist:', error);
    return false;
  }
}

/**
 * Toggle an asset in the watchlist (add if not present, remove if present)
 * @param asset Asset to toggle in watchlist
 * @returns True if asset was added, false if it was removed
 */
export function toggleWatchlist(asset: Asset): boolean {
  if (isInWatchlist(asset.id)) {
    removeFromWatchlist(asset.id);
    return false;
  } else {
    addToWatchlist(asset);
    return true;
  }
}

/**
 * Clear the entire watchlist
 */
export function clearWatchlist(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    localStorage.removeItem(`${WATCHLIST_STORAGE_KEY}_assets`);
  } catch (error) {
    console.error('Error clearing watchlist:', error);
  }
}
