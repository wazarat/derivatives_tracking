// Type declarations for @/config/columns module
declare module '@/config/columns' {
  // Base instrument type
  export interface Instrument {
    id: string;
    name: string;
    symbol: string;
    price?: number;
    [key: string]: any;
  }

  // CEX Perps instrument type
  export interface CEXPerpsInstrument extends Instrument {
    exchange: string;
    funding_rate?: number;
    open_interest?: number;
    volume_24h?: number;
    price_change_24h?: number;
  }

  // CEX Futures instrument type
  export interface CEXFuturesInstrument extends Instrument {
    exchange: string;
    expiry_date?: string;
    basis?: number;
    volume_24h?: number;
    open_interest?: number;
  }

  // DEX Perps instrument type
  export interface OnchainPerpInstrument extends Instrument {
    protocol: string;
    funding_rate?: number;
    open_interest?: number;
    volume_24h?: number;
    price_change_24h?: number;
  }

  // Type aliases for backward compatibility
  export type FuturesInstrument = CEXFuturesInstrument;
  export type PerpetualInstrument = CEXPerpsInstrument;
  export type DexPerpInstrument = OnchainPerpInstrument;

  // Column definitions
  export const cexPerpsColumns: any[];
  export const cexFuturesColumns: any[];
  export const onchainPerpColumns: any[];
  
  // Column aliases
  export const basisColumns: any[];
  export const fundingColumns: any[];
}
