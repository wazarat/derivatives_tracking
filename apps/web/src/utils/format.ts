/**
 * Format a number as currency with specified options
 * @param value Number to format
 * @param options Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  // Use 5 decimal places for prices under $100, 2 decimal places for $100+
  const decimalPlaces = value < 100 ? 5 : 2;
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    ...options,
  };

  return new Intl.NumberFormat('en-US', defaultOptions).format(value);
}

/**
 * Format a number as a percentage with specified options
 * @param value Number to format (e.g., 0.01 for 1%)
 * @param options Intl.NumberFormatOptions
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    ...options,
  };

  return new Intl.NumberFormat('en-US', defaultOptions).format(value);
}

/**
 * Format a large number with abbreviations (K, M, B, T)
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string with abbreviation
 */
export function formatCompactNumber(
  value: number,
  decimals: number = 2
): string {
  if (value === 0) return '0';
  
  const abbreviations = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
  
  if (tier === 0) return value.toFixed(decimals);
  
  const suffix = abbreviations[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = value / scale;
  
  return scaled.toFixed(decimals) + suffix;
}

/**
 * Format a number with commas as thousands separators
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat('en-US', defaultOptions).format(value);
}
