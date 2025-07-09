import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with commas as thousands separators
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null) return '-';
  
  // Handle very large numbers
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(decimals)}T`;
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as currency
 * @param value Number to format as currency
 * @param currency Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | undefined | null,
  currency: string = 'USD'
): string {
  if (value === undefined || value === null) return '-';
  
  // For very large values, use abbreviated format
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  
  // For smaller values, use standard currency format
  // Adjust decimal places based on value size
  const decimals = value < 1 ? 6 : value < 10 ? 4 : 2;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value Number to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number | undefined | null,
  decimals: number = 2
): string {
  if (value === undefined || value === null) return '-';
  
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format a date as a relative time (e.g., "2 hours ago")
 * @param date Date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | number | undefined | null): string {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (seconds < 60) {
    return 'Just now';
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return dateObj.toLocaleDateString();
  }
}
