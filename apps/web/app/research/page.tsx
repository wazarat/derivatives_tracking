"use client";

// Force dynamic rendering to prevent SSG from hitting Supabase during build
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SectorTile } from "@/components/research/SectorTile";
import { TrendingTable } from "@/components/research/TrendingTable";
import { CorrelationsTab } from "@/components/research/CorrelationsTab";

// Define sector data
const sectors = [
  {
    id: "cex-futures",
    name: "CEX Futures Traders",
    description: "Coming soon - Basis trading opportunities on centralized exchanges",
    icon: "📈",
    href: "",
    disabled: true,
  },
  {
    id: "cex-perps",
    name: "CEX Derivatives Traders",
    description: "Derivatives trading opportunities on centralized exchanges",
    icon: "🔄",
    href: "/research/cex-perps",
    disabled: false,
  },
  {
    id: "dex-perps",
    name: "DEX Perpetual Traders",
    description: "On-chain perpetual swap opportunities",
    icon: "⛓️",
    href: "/research/dex-perps",
    disabled: false,
  },
  {
    id: "options",
    name: "Crypto Options Traders",
    description: "Volatility and options trading strategies",
    icon: "🎯",
    href: "",
    disabled: true,
  },
  {
    id: "basis-funding-arb",
    name: "Basis / Funding-Arb Desks",
    description: "Arbitrage opportunities between markets",
    icon: "💹",
    href: "",
    disabled: true,
  },
  {
    id: "defi-leverage",
    name: "DeFi Leverage & Yield Loopers",
    description: "Leveraged yield farming strategies",
    icon: "🔄",
    href: "",
    disabled: true,
  },
  {
    id: "copy-trade",
    name: "Copy-Trade & Social-Signal Followers",
    description: "Social trading opportunities and signals",
    icon: "👥",
    href: "",
    disabled: true,
  },
  {
    id: "spot",
    name: "Spot-Only Token Traders",
    description: "Spot market trading opportunities",
    icon: "💱",
    href: "",
    disabled: true,
  },
  {
    id: "etf-trackers",
    name: "U.S. Crypto-ETF Trackers",
    description: "Track and analyze crypto ETF performance",
    icon: "📊",
    href: "",
    disabled: true,
  },
];

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState("sectors");
  const [activeTrendingTab, setActiveTrendingTab] = useState("futures");

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Research</h1>
        <p className="text-muted-foreground">
          Explore trading opportunities across different market sectors
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="trending">Trending Trades</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
        </TabsList>

        {/* Sectors Tab */}
        <TabsContent value="sectors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sector) => (
              <SectorTile
                key={sector.id}
                title={sector.name}
                route={sector.href}
                enabled={!sector.disabled}
              />
            ))}
          </div>
        </TabsContent>

        {/* Trending Trades Tab */}
        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs 
                value={activeTrendingTab} 
                onValueChange={setActiveTrendingTab} 
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="futures">Futures</TabsTrigger>
                  <TabsTrigger value="perps">Perps</TabsTrigger>
                  <TabsTrigger value="dex-perps">DEX Perps</TabsTrigger>
                </TabsList>
                
                <TabsContent value="futures">
                  <TrendingTable type="futures" />
                </TabsContent>
                
                <TabsContent value="perps">
                  <TrendingTable type="perps" />
                </TabsContent>
                
                <TabsContent value="dex-perps">
                  <TrendingTable type="dex-perps" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlations Tab */}
        <TabsContent value="correlations">
          <CorrelationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
