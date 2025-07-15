// Define base instrument type that all other instruments extend
export interface Instrument {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  [key: string]: any; // Allow for additional properties
}

// Define CEX Perps instrument type
export interface CEXPerpsInstrument extends Instrument {
  exchange: string;
  funding_rate?: number;
  open_interest?: number;
  volume_24h?: number;
  price_change_24h?: number;
}

// Define CEX Futures instrument type
export interface CEXFuturesInstrument extends Instrument {
  exchange: string;
  expiry_date?: string;
  basis?: number;
  volume_24h?: number;
  open_interest?: number;
}

// Define DEX Perps (Onchain Perp) instrument type
export interface OnchainPerpInstrument extends Instrument {
  protocol: string;
  funding_rate?: number;
  open_interest?: number;
  volume_24h?: number;
  price_change_24h?: number;
}

// Add type aliases for backward compatibility
export type FuturesInstrument = CEXFuturesInstrument;
export type PerpetualInstrument = CEXPerpsInstrument;
export type DexPerpInstrument = OnchainPerpInstrument;

// Export columns for different instrument types
export const cexPerpsColumns = [
  { id: "symbol", header: "Symbol", accessorKey: "symbol" },
  { id: "exchange", header: "Exchange", accessorKey: "exchange" },
  { id: "price", header: "Price", accessorKey: "price" },
  { id: "funding_rate", header: "Funding Rate", accessorKey: "funding_rate" },
  { id: "open_interest", header: "Open Interest", accessorKey: "open_interest" },
  { id: "volume_24h", header: "24h Volume", accessorKey: "volume_24h" },
  { id: "price_change_24h", header: "24h Change", accessorKey: "price_change_24h" },
];

export const cexFuturesColumns = [
  { id: "symbol", header: "Symbol", accessorKey: "symbol" },
  { id: "exchange", header: "Exchange", accessorKey: "exchange" },
  { id: "price", header: "Price", accessorKey: "price" },
  { id: "expiry_date", header: "Expiry", accessorKey: "expiry_date" },
  { id: "basis", header: "Basis", accessorKey: "basis" },
  { id: "volume_24h", header: "24h Volume", accessorKey: "volume_24h" },
  { id: "open_interest", header: "Open Interest", accessorKey: "open_interest" },
];

export const onchainPerpColumns = [
  { id: "symbol", header: "Symbol", accessorKey: "symbol" },
  { id: "protocol", header: "Protocol", accessorKey: "protocol" },
  { id: "price", header: "Price", accessorKey: "price" },
  { id: "funding_rate", header: "Funding Rate", accessorKey: "funding_rate" },
  { id: "open_interest", header: "Open Interest", accessorKey: "open_interest" },
  { id: "volume_24h", header: "24h Volume", accessorKey: "volume_24h" },
  { id: "price_change_24h", header: "24h Change", accessorKey: "price_change_24h" },
];

// Alias for cexFuturesColumns to match imports in cex-futures/page.tsx
export const basisColumns = cexFuturesColumns;

// Alias for cexPerpsColumns to match imports in cex-perps/page.tsx
export const fundingColumns = cexPerpsColumns;