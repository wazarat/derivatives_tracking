import { useQuery } from "@tanstack/react-query";
import { fetchSectorInstruments } from "@/services/assetService";
import { Instrument, FuturesInstrument, PerpetualInstrument, DexPerpInstrument } from "@/config/columns";

type InstrumentType = "futures" | "perps" | "dex-perps";

// Map sector names to their API endpoint identifiers
const sectorToEndpoint: Record<string, string> = {
  "cex-futures": "cex-futures",
  "cex-perps": "cex-perps", 
  "dex-perps": "dex-perps",
  "spot": "spot",
  "options": "options",
};

/**
 * Hook to fetch instruments by sector
 * @param sector The sector to fetch instruments for
 * @returns Query result with instruments data
 */
export function useInstruments<T extends Instrument>(sector: string) {
  return useQuery({
    queryKey: ["sectorInstruments", sector],
    queryFn: () => fetchSectorInstruments(sectorToEndpoint[sector] || sector) as Promise<T[]>,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch futures instruments
 * @returns Query result with futures instruments data
 */
export function useFuturesInstruments() {
  return useInstruments<FuturesInstrument>("cex-futures");
}

/**
 * Hook to fetch perpetual instruments
 * @returns Query result with perpetual instruments data
 */
export function usePerpetualInstruments() {
  return useInstruments<PerpetualInstrument>("cex-perps");
}

/**
 * Hook to fetch DEX perpetual instruments
 * @returns Query result with DEX perpetual instruments data
 */
export function useDexPerpInstruments() {
  return useInstruments<DexPerpInstrument>("dex-perps");
}

/**
 * Hook to fetch trending instruments by type
 * @param type The type of trending instruments to fetch
 * @returns Query result with trending instruments data
 */
export function useTrendingInstruments(type: InstrumentType) {
  return useQuery({
    queryKey: ["trendingInstruments", type],
    queryFn: async () => {
      // In a real implementation, this would call an API endpoint
      // For now, we'll return mock data
      const response = await fetch(`/api/v1/trending/${type}`);
      if (!response.ok) {
        throw new Error("Failed to fetch trending instruments");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
