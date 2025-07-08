import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Coins, BarChart3, Zap, Shield } from 'lucide-react';

export const metadata = {
  title: 'Crypto Sectors | CanHav',
  description: 'Explore different crypto sectors and their performance metrics',
};

const sectors = [
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized Finance protocols including lending, DEXs, and yield farming',
    metrics: ['TVL', 'Volume', 'Fees', 'Revenue', 'P/S Ratio'],
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
    count: 25,
  },
  {
    id: 'layer1',
    name: 'Layer 1',
    description: 'Base blockchain protocols that process and finalize transactions',
    metrics: ['TPS', 'Active Addresses', 'Fees', 'Staking Yield', 'NVT Ratio'],
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
    count: 18,
  },
  {
    id: 'layer2',
    name: 'Layer 2',
    description: 'Scaling solutions built on top of Layer 1 blockchains',
    metrics: ['TVL', 'TPS', 'Fees', 'Unique Users', 'Bridge Volume'],
    icon: <Zap className="h-6 w-6" />,
    color: 'bg-purple-100 dark:bg-purple-900',
    textColor: 'text-purple-700 dark:text-purple-300',
    count: 12,
  },
  {
    id: 'cex',
    name: 'CEX',
    description: 'Centralized Exchanges and their native tokens',
    metrics: ['Volume', 'Users', 'Revenue', 'Token Utility', 'Insurance Fund'],
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'bg-orange-100 dark:bg-orange-900',
    textColor: 'text-orange-700 dark:text-orange-300',
    count: 10,
  },
  {
    id: 'stablecoins',
    name: 'Stablecoins',
    description: 'Price-stable cryptocurrencies pegged to fiat or other assets',
    metrics: ['Market Cap', 'Collateralization', 'Peg Stability', 'Volume', 'Yield'],
    icon: <Coins className="h-6 w-6" />,
    color: 'bg-yellow-100 dark:bg-yellow-900',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    count: 15,
  },
];

export default function SectorsPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Crypto Sectors</h1>
        <p className="text-lg text-muted-foreground">
          Explore different crypto sectors and their key performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map((sector) => (
          <Link href={`/sectors/${sector.id}`} key={sector.id} className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${sector.color}`}>
                    {sector.icon}
                  </div>
                  <Badge variant="outline" className={sector.textColor}>
                    {sector.count} Assets
                  </Badge>
                </div>
                <CardTitle className="mt-4">{sector.name}</CardTitle>
                <CardDescription>{sector.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sector.metrics.map((metric) => (
                    <Badge key={metric} variant="secondary">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-sm text-primary font-medium">
                  View sector details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Understanding Crypto Sectors</h2>
        <p className="mb-4">
          Crypto sectors represent different categories of blockchain projects and digital assets grouped by their primary use case, technology, or market function. Each sector has unique metrics that help evaluate performance and potential.
        </p>
        <p>
          Click on any sector above to learn more about its specific metrics, top assets, and market trends. Our sector pages provide educational resources to help you make informed investment decisions.
        </p>
      </div>
    </div>
  );
}
