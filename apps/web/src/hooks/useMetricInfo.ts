import { useMemo } from "react";
import { getMetricInfo, getMetricsByCategory, MetricInfo } from "@/config/metrics";

/**
 * Hook to get metric information by key
 * @param key The metric key to get information for
 * @returns The metric information or undefined if not found
 */
export function useMetricInfo(key: string): MetricInfo | undefined {
  return useMemo(() => getMetricInfo(key), [key]);
}

/**
 * Hook to get metrics by category
 * @param category The category to filter metrics by
 * @returns Array of metric information for the specified category
 */
export function useMetricsByCategory(category: MetricInfo['category']): MetricInfo[] {
  return useMemo(() => getMetricsByCategory(category), [category]);
}

/**
 * Hook to get all metrics
 * @returns Object with metrics grouped by category
 */
export function useAllMetrics(): Record<MetricInfo['category'], MetricInfo[]> {
  return useMemo(() => {
    const categories: MetricInfo['category'][] = ['general', 'basis', 'funding', 'liquidity', 'onchain'];
    return categories.reduce((acc, category) => {
      acc[category] = getMetricsByCategory(category);
      return acc;
    }, {} as Record<MetricInfo['category'], MetricInfo[]>);
  }, []);
}
