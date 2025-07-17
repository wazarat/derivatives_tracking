import { useQuery } from '@tanstack/react-query';

// Define types locally until the generated types are available
interface DerivativesLatest {
  id: number;
  ts: string;
  exchange: string;
  symbol: string;
  contract_type: 'derivatives';
  oi_usd: number;
  funding_rate: number | null;
  volume_24h: number;
  index_price: number;
}

interface DerivativesStats {
  totalOpenInterest: number;
  totalVolume24h: number;
  averageFundingRate: number | null;
  contractCount: number;
}

// Define sector types
export type DerivativesSector = 'cex-perps' | 'cex-futures' | 'dex-perps';

// Comprehensive mock data for development and testing
const mockData: DerivativesLatest[] = [
  {
    id: 1,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "XRPUSDT",
    contract_type: 'derivatives',
    oi_usd: 869000000,
    funding_rate: null,
    volume_24h: 4794000000,
    index_price: 0.6163
  },
  {
    id: 2,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "ADA-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 668000000,
    funding_rate: -0.000281,
    volume_24h: 551000000,
    index_price: 0.5686
  },
  {
    id: 3,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 415000000,
    funding_rate: null,
    volume_24h: 4324000000,
    index_price: 188.13
  },
  {
    id: 4,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "BTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 1166000000,
    funding_rate: -6.1e-05,
    volume_24h: 742000000,
    index_price: 67967.86
  },
  {
    id: 5,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "XRP-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1045000000,
    funding_rate: 0.000287,
    volume_24h: 2773000000,
    index_price: 0.5931
  },
  {
    id: 6,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "DOTUSDT",
    contract_type: 'derivatives',
    oi_usd: 846000000,
    funding_rate: -4e-06,
    volume_24h: 4569000000,
    index_price: 7.17
  },
  {
    id: 7,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "BTC-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 339000000,
    funding_rate: -0.000156,
    volume_24h: 4595000000,
    index_price: 61894.31
  },
  {
    id: 8,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "AVAXUSDT",
    contract_type: 'derivatives',
    oi_usd: 871000000,
    funding_rate: null,
    volume_24h: 3571000000,
    index_price: 39.91
  },
  {
    id: 9,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 630000000,
    funding_rate: null,
    volume_24h: 3582000000,
    index_price: 175.1
  },
  {
    id: 10,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "AVAXUSDT",
    contract_type: 'derivatives',
    oi_usd: 238000000,
    funding_rate: -8.4e-05,
    volume_24h: 2145000000,
    index_price: 41.12
  },
  {
    id: 11,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "OPUSDT",
    contract_type: 'derivatives',
    oi_usd: 337000000,
    funding_rate: -0.000103,
    volume_24h: 1250000000,
    index_price: 3.65
  },
  {
    id: 12,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "AVAXUSDT",
    contract_type: 'derivatives',
    oi_usd: 144000000,
    funding_rate: -1e-05,
    volume_24h: 146000000,
    index_price: 40.78
  },
  {
    id: 13,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "XRP-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 96000000,
    funding_rate: 9.4e-05,
    volume_24h: 4591000000,
    index_price: 0.626
  },
  {
    id: 14,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "ADA-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1189000000,
    funding_rate: -6.6e-05,
    volume_24h: 687000000,
    index_price: 0.5773
  },
  {
    id: 15,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "BTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 664000000,
    funding_rate: 8.3e-05,
    volume_24h: 4942000000,
    index_price: 62752.3
  },
  {
    id: 16,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "DOGEUSDT",
    contract_type: 'derivatives',
    oi_usd: 206000000,
    funding_rate: -0.000197,
    volume_24h: 4423000000,
    index_price: 0.1555
  },
  {
    id: 17,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "DOGEUSDT",
    contract_type: 'derivatives',
    oi_usd: 1017000000,
    funding_rate: -0.00029,
    volume_24h: 3870000000,
    index_price: 0.1433
  },
  {
    id: 18,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "LINKUSDT",
    contract_type: 'derivatives',
    oi_usd: 670000000,
    funding_rate: 0.000209,
    volume_24h: 3566000000,
    index_price: 18.59
  },
  {
    id: 19,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "LINKUSDT",
    contract_type: 'derivatives',
    oi_usd: 653000000,
    funding_rate: 0.000212,
    volume_24h: 2587000000,
    index_price: 17.75
  },
  {
    id: 20,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "ETHUSDT",
    contract_type: 'derivatives',
    oi_usd: 298000000,
    funding_rate: -0.000175,
    volume_24h: 4631000000,
    index_price: 3386.17
  },
  {
    id: 21,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 849000000,
    funding_rate: 0.000125,
    volume_24h: 3236000000,
    index_price: 171.54
  },
  {
    id: 22,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "AVAXUSDT",
    contract_type: 'derivatives',
    oi_usd: 779000000,
    funding_rate: -9.1e-05,
    volume_24h: 1878000000,
    index_price: 40.1
  },
  {
    id: 23,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "BTC-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 695000000,
    funding_rate: 0.000286,
    volume_24h: 4395000000,
    index_price: 67312.08
  },
  {
    id: 24,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "DOTUSDT",
    contract_type: 'derivatives',
    oi_usd: 473000000,
    funding_rate: -0.000299,
    volume_24h: 1931000000,
    index_price: 6.68
  },
  {
    id: 25,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "SOL-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 234000000,
    funding_rate: -0.000271,
    volume_24h: 275000000,
    index_price: 184.12
  },
  {
    id: 26,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ADAUSDT",
    contract_type: 'derivatives',
    oi_usd: 971000000,
    funding_rate: -9.5e-05,
    volume_24h: 2959000000,
    index_price: 0.5493
  },
  {
    id: 27,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "BNBUSDT",
    contract_type: 'derivatives',
    oi_usd: 894000000,
    funding_rate: -0.000201,
    volume_24h: 2132000000,
    index_price: 672.0
  },
  {
    id: 28,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ETHUSDT",
    contract_type: 'derivatives',
    oi_usd: 912000000,
    funding_rate: 0.000226,
    volume_24h: 4364000000,
    index_price: 3330.09
  },
  {
    id: 29,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "BTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 117000000,
    funding_rate: null,
    volume_24h: 714000000,
    index_price: 66543.02
  },
  {
    id: 30,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "SOL-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 734000000,
    funding_rate: -0.000183,
    volume_24h: 1285000000,
    index_price: 171.09
  },
  {
    id: 31,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "XRP-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 598000000,
    funding_rate: 0.000242,
    volume_24h: 904000000,
    index_price: 0.6144
  },
  {
    id: 32,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ADAUSDT",
    contract_type: 'derivatives',
    oi_usd: 1036000000,
    funding_rate: -0.000144,
    volume_24h: 1465000000,
    index_price: 0.5686
  },
  {
    id: 33,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "LINKUSDT",
    contract_type: 'derivatives',
    oi_usd: 869000000,
    funding_rate: -2.2e-05,
    volume_24h: 3756000000,
    index_price: 18.03
  },
  {
    id: 34,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ADAUSDT",
    contract_type: 'derivatives',
    oi_usd: 879000000,
    funding_rate: -0.000165,
    volume_24h: 4107000000,
    index_price: 0.5374
  },
  {
    id: 35,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "DOTUSDT",
    contract_type: 'derivatives',
    oi_usd: 170000000,
    funding_rate: 0.000145,
    volume_24h: 4767000000,
    index_price: 6.67
  },
  {
    id: 36,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "BNBUSDT",
    contract_type: 'derivatives',
    oi_usd: 1120000000,
    funding_rate: -0.000135,
    volume_24h: 4623000000,
    index_price: 644.83
  },
  {
    id: 37,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "DOTUSDT",
    contract_type: 'derivatives',
    oi_usd: 900000000,
    funding_rate: 0.000106,
    volume_24h: 1486000000,
    index_price: 6.8
  },
  {
    id: 38,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "OPUSDT",
    contract_type: 'derivatives',
    oi_usd: 997000000,
    funding_rate: 3.6e-05,
    volume_24h: 2610000000,
    index_price: 3.61
  },
  {
    id: 39,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "LINKUSDT",
    contract_type: 'derivatives',
    oi_usd: 203000000,
    funding_rate: -0.000192,
    volume_24h: 2295000000,
    index_price: 17.35
  },
  {
    id: 40,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "ETH-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1135000000,
    funding_rate: 0.000102,
    volume_24h: 2455000000,
    index_price: 3571.37
  },
  {
    id: 41,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "DOTUSDT",
    contract_type: 'derivatives',
    oi_usd: 114000000,
    funding_rate: -5.4e-05,
    volume_24h: 2972000000,
    index_price: 6.72
  },
  {
    id: 42,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ETHUSDT",
    contract_type: 'derivatives',
    oi_usd: 772000000,
    funding_rate: -0.000284,
    volume_24h: 885000000,
    index_price: 3370.05
  },
  {
    id: 43,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "BNBUSDT",
    contract_type: 'derivatives',
    oi_usd: 1173000000,
    funding_rate: -0.000123,
    volume_24h: 182000000,
    index_price: 625.02
  },
  {
    id: 44,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 1154000000,
    funding_rate: -6.8e-05,
    volume_24h: 3045000000,
    index_price: 176.54
  },
  {
    id: 45,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "SOL-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 357000000,
    funding_rate: -0.000247,
    volume_24h: 455000000,
    index_price: 171.26
  },
  {
    id: 46,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 573000000,
    funding_rate: -0.000204,
    volume_24h: 890000000,
    index_price: 177.79
  },
  {
    id: 47,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 872000000,
    funding_rate: -0.000115,
    volume_24h: 4399000000,
    index_price: 182.64
  },
  {
    id: 48,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 541000000,
    funding_rate: 1.5e-05,
    volume_24h: 4380000000,
    index_price: 187.35
  },
  {
    id: 49,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "ETH-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 917000000,
    funding_rate: -0.000228,
    volume_24h: 250000000,
    index_price: 3600.51
  },
  {
    id: 50,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "XRP-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 509000000,
    funding_rate: -0.000155,
    volume_24h: 4133000000,
    index_price: 0.616
  },
  {
    id: 51,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 605000000,
    funding_rate: -8.1e-05,
    volume_24h: 589000000,
    index_price: 183.97
  },
  {
    id: 52,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "ETHUSDT",
    contract_type: 'derivatives',
    oi_usd: 390000000,
    funding_rate: -0.000275,
    volume_24h: 1856000000,
    index_price: 3458.96
  },
  {
    id: 53,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "DOGEUSDT",
    contract_type: 'derivatives',
    oi_usd: 1008000000,
    funding_rate: -0.000193,
    volume_24h: 3073000000,
    index_price: 0.1534
  },
  {
    id: 54,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "DOGEUSDT",
    contract_type: 'derivatives',
    oi_usd: 1053000000,
    funding_rate: -0.000193,
    volume_24h: 1177000000,
    index_price: 0.1522
  },
  {
    id: 55,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "BNB-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1073000000,
    funding_rate: -0.000252,
    volume_24h: 3764000000,
    index_price: 631.9
  },
  {
    id: 56,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "ADA-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1037000000,
    funding_rate: -0.000267,
    volume_24h: 3893000000,
    index_price: 0.5358
  },
  {
    id: 57,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "BTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 1023000000,
    funding_rate: 0.000245,
    volume_24h: 3683000000,
    index_price: 65321.78
  },
  {
    id: 58,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "BTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 1077000000,
    funding_rate: 0.000245,
    volume_24h: 4968000000,
    index_price: 65321.78
  },
  {
    id: 59,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "SOL-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1022000000,
    funding_rate: -0.000122,
    volume_24h: 3339000000,
    index_price: 181.37
  },
  {
    id: 60,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "BTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 1195000000,
    funding_rate: -0.000118,
    volume_24h: 4913000000,
    index_price: 65432.91
  },
  {
    id: 61,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 1069000000,
    funding_rate: 0.000101,
    volume_24h: 1304000000,
    index_price: 180.23
  },
  {
    id: 62,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "LINKUSDT",
    contract_type: 'derivatives',
    oi_usd: 1142000000,
    funding_rate: 0.000235,
    volume_24h: 3149000000,
    index_price: 18.12
  },
  {
    id: 63,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "BTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 1029000000,
    funding_rate: -0.000118,
    volume_24h: 4913000000,
    index_price: 65432.91
  },
  {
    id: 64,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 1069000000,
    funding_rate: 0.000101,
    volume_24h: 1304000000,
    index_price: 180.23
  },
  {
    id: 65,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "LINKUSDT",
    contract_type: 'derivatives',
    oi_usd: 1142000000,
    funding_rate: 0.000235,
    volume_24h: 3149000000,
    index_price: 18.12
  },
  {
    id: 66,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "DOT-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1084000000,
    funding_rate: -0.000137,
    volume_24h: 1219000000,
    index_price: 6.91
  },
  {
    id: 67,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "BTC-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1157000000,
    funding_rate: 0.000286,
    volume_24h: 1063000000,
    index_price: 65987.45
  },
  {
    id: 68,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ETHUSDT",
    contract_type: 'derivatives',
    oi_usd: 1124000000,
    funding_rate: 0.000226,
    volume_24h: 1364000000,
    index_price: 3430.09
  },
  {
    id: 69,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "OPUSDT",
    contract_type: 'derivatives',
    oi_usd: 1197000000,
    funding_rate: 3.6e-05,
    volume_24h: 2610000000,
    index_price: 3.61
  },
  {
    id: 70,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "LINKUSDT",
    contract_type: 'derivatives',
    oi_usd: 1203000000,
    funding_rate: -0.000192,
    volume_24h: 2295000000,
    index_price: 17.35
  },
  {
    id: 71,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "ETH-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1135000000,
    funding_rate: 0.000102,
    volume_24h: 2455000000,
    index_price: 3571.37
  },
  {
    id: 72,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "DOTUSDT",
    contract_type: 'derivatives',
    oi_usd: 1114000000,
    funding_rate: -5.4e-05,
    volume_24h: 2972000000,
    index_price: 6.72
  },
  {
    id: 73,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ETHUSDT",
    contract_type: 'derivatives',
    oi_usd: 1172000000,
    funding_rate: -0.000284,
    volume_24h: 885000000,
    index_price: 3370.05
  },
  {
    id: 74,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "BNBUSDT",
    contract_type: 'derivatives',
    oi_usd: 1173000000,
    funding_rate: -0.000123,
    volume_24h: 182000000,
    index_price: 625.02
  },
  {
    id: 75,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SOLUSDT",
    contract_type: 'derivatives',
    oi_usd: 1154000000,
    funding_rate: -6.8e-05,
    volume_24h: 3045000000,
    index_price: 176.54
  },
  {
    id: 76,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "DOGE-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 957000000,
    funding_rate: -0.000247,
    volume_24h: 1455000000,
    index_price: 0.1526
  },
  {
    id: 77,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "AVAXUSDT",
    contract_type: 'derivatives',
    oi_usd: 873000000,
    funding_rate: -0.000204,
    volume_24h: 2890000000,
    index_price: 37.79
  },
  {
    id: 78,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "XRPUSDT",
    contract_type: 'derivatives',
    oi_usd: 872000000,
    funding_rate: -0.000115,
    volume_24h: 3399000000,
    index_price: 0.6264
  },
  {
    id: 79,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "MATICUSDT",
    contract_type: 'derivatives',
    oi_usd: 741000000,
    funding_rate: 0.000015,
    volume_24h: 2380000000,
    index_price: 0.8935
  },
  {
    id: 80,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "AVAX-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 917000000,
    funding_rate: -0.000228,
    volume_24h: 1250000000,
    index_price: 38.51
  },
  {
    id: 81,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "MATICUSDT",
    contract_type: 'derivatives',
    oi_usd: 809000000,
    funding_rate: -0.000155,
    volume_24h: 2133000000,
    index_price: 0.896
  },
  {
    id: 82,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "ATOMUSDT",
    contract_type: 'derivatives',
    oi_usd: 605000000,
    funding_rate: -0.000081,
    volume_24h: 1589000000,
    index_price: 9.97
  },
  {
    id: 83,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SHIBUSDT",
    contract_type: 'derivatives',
    oi_usd: 790000000,
    funding_rate: -0.000275,
    volume_24h: 1856000000,
    index_price: 0.00002196
  },
  {
    id: 84,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "LTCUSDT",
    contract_type: 'derivatives',
    oi_usd: 1008000000,
    funding_rate: -0.000193,
    volume_24h: 1073000000,
    index_price: 87.34
  },
  {
    id: 85,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "NEAR-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1053000000,
    funding_rate: -0.000193,
    volume_24h: 1177000000,
    index_price: 5.22
  },
  {
    id: 86,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "LINK-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1073000000,
    funding_rate: -0.000252,
    volume_24h: 1764000000,
    index_price: 17.90
  },
  {
    id: 87,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "APTUSDT",
    contract_type: 'derivatives',
    oi_usd: 1037000000,
    funding_rate: -0.000267,
    volume_24h: 1893000000,
    index_price: 8.58
  },
  {
    id: 88,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "TRXUSDT",
    contract_type: 'derivatives',
    oi_usd: 1023000000,
    funding_rate: 0.000245,
    volume_24h: 1683000000,
    index_price: 0.1321
  },
  {
    id: 89,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "INJUSDT",
    contract_type: 'derivatives',
    oi_usd: 1077000000,
    funding_rate: 0.000245,
    volume_24h: 1968000000,
    index_price: 32.78
  },
  {
    id: 90,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "ATOM-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1022000000,
    funding_rate: -0.000122,
    volume_24h: 1339000000,
    index_price: 10.37
  },
  {
    id: 91,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "FILUSDT",
    contract_type: 'derivatives',
    oi_usd: 1195000000,
    funding_rate: -0.000118,
    volume_24h: 1913000000,
    index_price: 5.91
  },
  {
    id: 92,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "UNIUSDT",
    contract_type: 'derivatives',
    oi_usd: 1069000000,
    funding_rate: 0.000101,
    volume_24h: 1304000000,
    index_price: 8.23
  },
  {
    id: 93,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "AAVEUSDT",
    contract_type: 'derivatives',
    oi_usd: 1142000000,
    funding_rate: 0.000235,
    volume_24h: 1149000000,
    index_price: 98.12
  },
  {
    id: 94,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "SHIB-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1029000000,
    funding_rate: -0.000118,
    volume_24h: 1913000000,
    index_price: 0.00002191
  },
  {
    id: 95,
    ts: "2025-07-16T12:00:00Z",
    exchange: "binance",
    symbol: "NEARUSDT",
    contract_type: 'derivatives',
    oi_usd: 1069000000,
    funding_rate: 0.000101,
    volume_24h: 1304000000,
    index_price: 5.23
  },
  {
    id: 96,
    ts: "2025-07-16T12:00:00Z",
    exchange: "bybit",
    symbol: "SNXUSDT",
    contract_type: 'derivatives',
    oi_usd: 1142000000,
    funding_rate: 0.000235,
    volume_24h: 1149000000,
    index_price: 7.12
  },
  {
    id: 97,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "FIL-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1084000000,
    funding_rate: -0.000137,
    volume_24h: 1219000000,
    index_price: 5.91
  },
  {
    id: 98,
    ts: "2025-07-16T12:00:00Z",
    exchange: "okx",
    symbol: "UNI-USDT-SWAP",
    contract_type: 'derivatives',
    oi_usd: 1157000000,
    funding_rate: 0.000286,
    volume_24h: 1063000000,
    index_price: 16.66
  }
];

/**
 * Fetch derivatives data from the API
 * @param sector The derivatives sector to fetch (cex-perps, cex-futures, dex-perps)
 * @returns Promise with the derivatives data
 */
async function fetchDerivatives(sector: DerivativesSector): Promise<DerivativesLatest[]> {
  console.log(`[useDerivatives] Fetching ${sector} data`);
  
  try {
    // Add cache-busting parameter to prevent stale data
    const cacheBuster = new Date().getTime();
    
    // Determine the API endpoint based on the sector
    let endpoint = '';
    if (sector === 'dex-perps') {
      endpoint = '/api/crypto/dex-perps';
    } else {
      // Both cex-perps and cex-futures use the same unified endpoint
      endpoint = '/api/derivatives/all';
    }
    
    // Use window.location.origin to ensure correct base URL in all environments
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}${endpoint}?t=${cacheBuster}`;
    
    console.log(`[useDerivatives] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('[useDerivatives] API response status:', response.status);
    
    if (!response.ok) {
      console.error('[useDerivatives] Error response:', response.statusText);
      // Try to get more details from the error response
      try {
        const errorData = await response.json();
        console.error('[useDerivatives] Error details:', errorData);
      } catch (e) {
        console.error('[useDerivatives] Could not parse error response');
      }
      console.log('[useDerivatives] Falling back to mock data due to API error');
      return mockData; // Fallback to mock data on error
    }
    
    const data = await response.json();
    console.log('[useDerivatives] Received data count:', data?.data?.length || 0);
    
    if (!data || !data.data || data.data.length === 0) {
      console.log('[useDerivatives] No data returned from API, falling back to mock data');
      return mockData; // Fallback to mock data if no data returned
    }
    
    // Ensure all contracts are treated as 'derivatives'
    const normalizedData = data.data.map((item: any) => ({
      ...item,
      contract_type: 'derivatives'
    }));
    
    // Log a sample of the data
    if (normalizedData.length > 0) {
      console.log('[useDerivatives] Sample data item:', JSON.stringify(normalizedData[0]));
      
      // Count by exchange
      const exchanges = Array.from(new Set(normalizedData.map((item: any) => item.exchange)));
      const exchangeCounts: Record<string, number> = {};
      exchanges.forEach(exchange => {
        exchangeCounts[exchange as string] = normalizedData.filter((item: any) => item.exchange === exchange).length;
      });
      console.log('[useDerivatives] Exchange counts:', exchangeCounts);
    }
    
    return normalizedData;
  } catch (error) {
    console.error('[useDerivatives] Error fetching derivatives data:', error);
    console.log('[useDerivatives] Falling back to mock data due to error');
    return mockData; // Fallback to mock data on error
  }
}

/**
 * Calculate aggregated statistics from derivatives data
 * @param data Array of derivatives contracts
 * @returns Object with aggregated statistics
 */
export function calculateDerivativesStats(data: DerivativesLatest[]): DerivativesStats {
  if (!data || data.length === 0) {
    return {
      totalOpenInterest: 0,
      totalVolume24h: 0,
      averageFundingRate: null,
      contractCount: 0,
    };
  }
  
  const totalOpenInterest = data.reduce((sum, item) => sum + item.oi_usd, 0);
  const totalVolume24h = data.reduce((sum, item) => sum + item.volume_24h, 0);
  
  // Calculate average funding rate for all contracts with non-null funding rates
  const contractsWithFundingRate = data.filter(item => item.funding_rate !== null);
  
  const averageFundingRate = contractsWithFundingRate.length > 0
    ? contractsWithFundingRate.reduce((sum, item) => sum + (item.funding_rate || 0), 0) / contractsWithFundingRate.length
    : null;
  
  return {
    totalOpenInterest,
    totalVolume24h,
    averageFundingRate,
    contractCount: data.length,
  };
}

/**
 * React Query hook for fetching derivatives data
 * @param sector The derivatives sector to fetch (cex-perps, cex-futures, dex-perps)
 * @returns Query result with derivatives data and stats
 */
export function useDerivatives(sector: DerivativesSector) {
  console.log('[useDerivatives] Hook called with sector:', sector);
  
  return useQuery<DerivativesLatest[], Error, { data: DerivativesLatest[], stats: DerivativesStats }>({
    queryKey: ['derivatives', 'cmc-api', sector], // Include sector in the key for proper caching
    queryFn: () => fetchDerivatives(sector),
    refetchInterval: 30000, // Refetch every 30 seconds
    select: (data) => {
      console.log('[useDerivatives] Received data from query:', data?.length || 0, 'items');
      console.log('[useDerivatives] Is mock data?', data === mockData ? 'YES - Using mock data' : 'NO - Using real data');
      return {
        data,
        stats: calculateDerivativesStats(data),
      };
    },
  });
}
