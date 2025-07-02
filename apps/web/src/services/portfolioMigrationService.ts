import { 
  getPortfoliosFromLocalStorage, 
  Portfolio,
  savePortfolioToLocalStorage
} from './portfolioService';
import { savePortfolioToSupabase } from './supabasePortfolioService';

/**
 * Migrates all portfolios from localStorage to Supabase for a given user
 * @param userId The ID of the authenticated user
 * @returns Object containing success status and migration results
 */
export const migrateLocalPortfoliosToSupabase = async (
  userId: string
): Promise<{
  success: boolean;
  migrated: number;
  failed: number;
  errors: string[];
}> => {
  // Get all portfolios from localStorage
  const localPortfolios = getPortfoliosFromLocalStorage();
  
  // Track migration results
  const result = {
    success: false,
    migrated: 0,
    failed: 0,
    errors: [] as string[]
  };
  
  // If no portfolios to migrate, return early
  if (localPortfolios.length === 0) {
    result.success = true;
    return result;
  }
  
  // Migrate each portfolio to Supabase
  for (const portfolio of localPortfolios) {
    try {
      // Skip portfolios that already have a userId (they're already in Supabase)
      if (portfolio.userId) {
        continue;
      }
      
      // Save to Supabase
      const savedPortfolio = await savePortfolioToSupabase(portfolio, userId);
      
      if (savedPortfolio) {
        // Update the local copy with the Supabase ID and userId
        savePortfolioToLocalStorage(savedPortfolio);
        result.migrated++;
      } else {
        result.failed++;
        result.errors.push(`Failed to migrate portfolio: ${portfolio.name}`);
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`Error migrating portfolio ${portfolio.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  result.success = result.failed === 0;
  return result;
};

/**
 * Checks if there are any local portfolios that need to be migrated to Supabase
 * @returns The number of portfolios that need migration
 */
export const getPortfoliosNeedingMigration = (): number => {
  const localPortfolios = getPortfoliosFromLocalStorage();
  return localPortfolios.filter(portfolio => !portfolio.userId).length;
};
