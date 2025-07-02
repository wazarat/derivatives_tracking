import { z } from 'zod';

// Enum definitions
export enum Sector {
  STABLECOIN = "stablecoin",
  TOKENIZED_RWA = "tokenized_rwa",
  DEFI_YIELD = "defi_yield",
  LIQUID_STAKING = "liquid_staking",
  REAL_YIELD = "real_yield",
  CRYPTO_CREDIT = "crypto_credit",
  CRYPTO_STRUCTURED = "crypto_structured",
  CRYPTO_OPTIONS = "crypto_options",
  CRYPTO_PERPS = "crypto_perps"
}

export enum RiskTier {
  CASH_CORE = "cash_core",
  INCOME = "income",
  INCOME_PLUS = "income_plus",
  BALANCED = "balanced",
  GROWTH = "growth",
  AGGRESSIVE = "aggressive"
}

// Zod schemas for validation
export const SectorSchema = z.nativeEnum(Sector);
export const RiskTierSchema = z.nativeEnum(RiskTier);

export const AssetSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string(),
  sector: SectorSchema,
  risk_tier: RiskTierSchema,
  risk_score: z.number().optional(),
  logo_url: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  market_data: z.record(z.any()).optional().nullable(),
  reserves: z.record(z.any()).optional().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const AssetListResponseSchema = z.object({
  data: z.array(AssetSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number()
});

export const AssetMetricSchema = z.object({
  id: z.string(),
  asset_id: z.string(),
  metric_type: z.string(),
  value: z.number(),
  timestamp: z.string()
});

export const AssetMetricsResponseSchema = z.object({
  asset_id: z.string(),
  metrics: z.array(AssetMetricSchema),
  start_date: z.string(),
  end_date: z.string(),
  count: z.number()
});

export const AssetRiskScoreResponseSchema = z.object({
  asset_id: z.string(),
  risk_tier: RiskTierSchema,
  score: z.number(),
  updated_at: z.string()
});

// TypeScript types derived from Zod schemas
export type Asset = z.infer<typeof AssetSchema>;
export type AssetListResponse = z.infer<typeof AssetListResponseSchema>;
export type AssetMetric = z.infer<typeof AssetMetricSchema>;
export type AssetMetricsResponse = z.infer<typeof AssetMetricsResponseSchema>;
export type AssetRiskScoreResponse = z.infer<typeof AssetRiskScoreResponseSchema>;

// Helper functions for sector and risk tier display
export const sectorDisplayNames: Record<Sector, string> = {
  [Sector.STABLECOIN]: "Stablecoins",
  [Sector.TOKENIZED_RWA]: "Tokenized RWAs",
  [Sector.DEFI_YIELD]: "DeFi Yield",
  [Sector.LIQUID_STAKING]: "Liquid Staking",
  [Sector.REAL_YIELD]: "Real Yield",
  [Sector.CRYPTO_CREDIT]: "Crypto Credit",
  [Sector.CRYPTO_STRUCTURED]: "Structured Products",
  [Sector.CRYPTO_OPTIONS]: "Options",
  [Sector.CRYPTO_PERPS]: "Perpetuals"
};

export const riskTierDisplayNames: Record<RiskTier, string> = {
  [RiskTier.CASH_CORE]: "Cash Core (T1)",
  [RiskTier.INCOME]: "Income (T2)",
  [RiskTier.INCOME_PLUS]: "Income Plus (T2.5)",
  [RiskTier.BALANCED]: "Balanced (T3)",
  [RiskTier.GROWTH]: "Growth (T4)",
  [RiskTier.AGGRESSIVE]: "Aggressive (T5)"
};

export const riskTierColors: Record<RiskTier, string> = {
  [RiskTier.CASH_CORE]: "#4ade80", // Green
  [RiskTier.INCOME]: "#a3e635", // Light green
  [RiskTier.INCOME_PLUS]: "#facc15", // Yellow
  [RiskTier.BALANCED]: "#fb923c", // Orange
  [RiskTier.GROWTH]: "#f87171", // Light red
  [RiskTier.AGGRESSIVE]: "#ef4444" // Red
};

export const sectorColors: Record<Sector, string> = {
  [Sector.STABLECOIN]: "#3b82f6", // Blue
  [Sector.TOKENIZED_RWA]: "#6366f1", // Indigo
  [Sector.DEFI_YIELD]: "#8b5cf6", // Violet
  [Sector.LIQUID_STAKING]: "#a855f7", // Purple
  [Sector.REAL_YIELD]: "#d946ef", // Fuchsia
  [Sector.CRYPTO_CREDIT]: "#ec4899", // Pink
  [Sector.CRYPTO_STRUCTURED]: "#f43f5e", // Rose
  [Sector.CRYPTO_OPTIONS]: "#f97316", // Orange
  [Sector.CRYPTO_PERPS]: "#eab308" // Yellow
};
