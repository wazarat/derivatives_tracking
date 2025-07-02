import { z } from 'zod';
import { Asset } from '@/types/assets';

// Define portfolio entry schema
export const PortfolioEntrySchema = z.object({
  assetId: z.string(),
  asset: z.any(), // Full asset data
  allocation: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
});

export type PortfolioEntry = z.infer<typeof PortfolioEntrySchema>;

// Define portfolio schema
export const PortfolioSchema = z.object({
  id: z.string().optional(),
  name: z.string().default('My Portfolio'),
  description: z.string().optional(),
  entries: z.array(PortfolioEntrySchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isPublic: z.boolean().default(false),
  userId: z.string().optional(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

/**
 * Calculate the weighted average of a numeric property across portfolio entries
 * @param portfolio The portfolio to calculate for
 * @param propertyGetter Function to extract the numeric property from an asset
 * @returns The weighted average or null if no valid entries
 */
export function calculateWeightedAverage(
  portfolio: Portfolio,
  propertyGetter: (asset: Asset) => number | undefined | null
): number | null {
  if (!portfolio.entries.length) return null;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const entry of portfolio.entries) {
    const value = propertyGetter(entry.asset);
    if (value !== undefined && value !== null) {
      weightedSum += value * entry.weight;
      totalWeight += entry.weight;
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

/**
 * Calculate the total expected APY for a portfolio
 * @param portfolio The portfolio to calculate APY for
 * @returns The weighted average APY or null if no valid entries
 */
export function calculatePortfolioAPY(portfolio: Portfolio): number | null {
  return calculateWeightedAverage(
    portfolio,
    (asset) => asset.market_data?.apy || null
  );
}

/**
 * Calculate the composite risk score for a portfolio
 * @param portfolio The portfolio to calculate risk for
 * @returns The weighted average risk score or null if no valid entries
 */
export function calculatePortfolioRisk(portfolio: Portfolio): number | null {
  return calculateWeightedAverage(
    portfolio,
    (asset) => asset.risk_score
  );
}

/**
 * Calculate the volatility for a portfolio
 * @param portfolio The portfolio to calculate volatility for
 * @returns The weighted average volatility or null if no valid entries
 */
export function calculatePortfolioVolatility(portfolio: Portfolio): number | null {
  return calculateWeightedAverage(
    portfolio,
    (asset) => asset.market_data?.volatility_30d || null
  );
}

/**
 * Normalize portfolio weights to ensure they sum to 1.0
 * @param portfolio The portfolio to normalize
 * @returns A new portfolio with normalized weights
 */
export function normalizePortfolioWeights(portfolio: Portfolio): Portfolio {
  const totalAllocation = portfolio.entries.reduce(
    (sum, entry) => sum + entry.allocation,
    0
  );

  if (totalAllocation === 0) return portfolio;

  const normalizedEntries = portfolio.entries.map(entry => ({
    ...entry,
    weight: entry.allocation / totalAllocation,
  }));

  return {
    ...portfolio,
    entries: normalizedEntries,
  };
}

/**
 * Create a new empty portfolio
 * @returns An empty portfolio object
 */
export function createEmptyPortfolio(): Portfolio {
  return {
    name: 'My Portfolio',
    description: '',
    entries: [],
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Add an asset to a portfolio with the specified allocation
 * @param portfolio The portfolio to modify
 * @param asset The asset to add
 * @param allocation The percentage allocation (0-100)
 * @returns A new portfolio with the added asset
 */
export function addAssetToPortfolio(
  portfolio: Portfolio,
  asset: Asset,
  allocation: number = 0
): Portfolio {
  // Check if asset already exists in portfolio
  const existingIndex = portfolio.entries.findIndex(entry => entry.assetId === asset.id);
  
  let updatedEntries;
  if (existingIndex >= 0) {
    // Update existing entry
    updatedEntries = [...portfolio.entries];
    updatedEntries[existingIndex] = {
      ...updatedEntries[existingIndex],
      allocation: allocation,
    };
  } else {
    // Add new entry
    updatedEntries = [
      ...portfolio.entries,
      {
        assetId: asset.id,
        asset,
        allocation,
        weight: 0, // Will be calculated by normalizePortfolioWeights
      },
    ];
  }

  const updatedPortfolio = {
    ...portfolio,
    entries: updatedEntries,
    updatedAt: new Date(),
  };

  return normalizePortfolioWeights(updatedPortfolio);
}

/**
 * Remove an asset from a portfolio
 * @param portfolio The portfolio to modify
 * @param assetId The ID of the asset to remove
 * @returns A new portfolio with the asset removed
 */
export function removeAssetFromPortfolio(
  portfolio: Portfolio,
  assetId: string
): Portfolio {
  const updatedEntries = portfolio.entries.filter(entry => entry.assetId !== assetId);
  
  const updatedPortfolio = {
    ...portfolio,
    entries: updatedEntries,
    updatedAt: new Date(),
  };

  return normalizePortfolioWeights(updatedPortfolio);
}

/**
 * Update the allocation of an asset in a portfolio
 * @param portfolio The portfolio to modify
 * @param assetId The ID of the asset to update
 * @param allocation The new percentage allocation (0-100)
 * @returns A new portfolio with the updated allocation
 */
export function updateAssetAllocation(
  portfolio: Portfolio,
  assetId: string,
  allocation: number
): Portfolio {
  const updatedEntries = portfolio.entries.map(entry => 
    entry.assetId === assetId
      ? { ...entry, allocation }
      : entry
  );
  
  const updatedPortfolio = {
    ...portfolio,
    entries: updatedEntries,
    updatedAt: new Date(),
  };

  return normalizePortfolioWeights(updatedPortfolio);
}

/**
 * Save a portfolio to localStorage
 * @param portfolio The portfolio to save
 */
export function savePortfolioToLocalStorage(portfolio: Portfolio): void {
  try {
    const portfolios = getPortfoliosFromLocalStorage();
    
    // Generate an ID if one doesn't exist
    const portfolioToSave = portfolio.id 
      ? portfolio 
      : { ...portfolio, id: `portfolio-${Date.now()}` };
    
    // Update if exists, otherwise add
    const existingIndex = portfolios.findIndex(p => p.id === portfolioToSave.id);
    if (existingIndex >= 0) {
      portfolios[existingIndex] = portfolioToSave;
    } else {
      portfolios.push(portfolioToSave);
    }
    
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
  } catch (error) {
    console.error('Error saving portfolio to localStorage:', error);
  }
}

/**
 * Get all portfolios from localStorage
 * @returns Array of portfolios
 */
export function getPortfoliosFromLocalStorage(): Portfolio[] {
  try {
    const portfoliosJson = localStorage.getItem('portfolios');
    if (!portfoliosJson) return [];
    
    const portfolios = JSON.parse(portfoliosJson);
    return Array.isArray(portfolios) ? portfolios : [];
  } catch (error) {
    console.error('Error getting portfolios from localStorage:', error);
    return [];
  }
}

/**
 * Get a specific portfolio from localStorage by ID
 * @param portfolioId The ID of the portfolio to retrieve
 * @returns The portfolio or null if not found
 */
export function getPortfolioById(portfolioId: string): Portfolio | null {
  try {
    const portfolios = getPortfoliosFromLocalStorage();
    return portfolios.find(p => p.id === portfolioId) || null;
  } catch (error) {
    console.error('Error getting portfolio by ID:', error);
    return null;
  }
}

/**
 * Delete a portfolio from localStorage
 * @param portfolioId The ID of the portfolio to delete
 * @returns True if successful, false otherwise
 */
export function deletePortfolio(portfolioId: string): boolean {
  try {
    const portfolios = getPortfoliosFromLocalStorage();
    const updatedPortfolios = portfolios.filter(p => p.id !== portfolioId);
    localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
    return true;
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return false;
  }
}
