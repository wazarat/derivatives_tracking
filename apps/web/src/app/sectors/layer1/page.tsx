import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const metadata = {
  title: 'Layer 1 Blockchains | CanHav',
  description: 'Explore Layer 1 blockchain protocols, metrics, and performance indicators',
};

// Sample data for Layer 1 blockchains
const layer1Protocols = [
  {
    name: 'Ethereum',
    consensus: 'PoS',
    tps: '15-30',
    activeAddresses: '500K+',
    fees24h: '$3.2M',
    stakingYield: '3.8%',
    nvtRatio: '42.3',
  },
  {
    name: 'Solana',
    consensus: 'PoS',
    tps: '2,000+',
    activeAddresses: '300K+',
    fees24h: '$120K',
    stakingYield: '6.2%',
    nvtRatio: '68.5',
  },
  {
    name: 'Avalanche',
    consensus: 'PoS',
    tps: '4,500+',
    activeAddresses: '180K+',
    fees24h: '$85K',
    stakingYield: '8.5%',
    nvtRatio: '54.1',
  },
  {
    name: 'Cosmos Hub',
    consensus: 'PoS',
    tps: '10K+',
    activeAddresses: '120K+',
    fees24h: '$42K',
    stakingYield: '15.2%',
    nvtRatio: '37.8',
  },
  {
    name: 'Polkadot',
    consensus: 'NPoS',
    tps: '1,000+',
    activeAddresses: '95K+',
    fees24h: '$38K',
    stakingYield: '14.3%',
    nvtRatio: '45.6',
  },
];

// Metrics definitions
const metrics = [
  {
    name: 'TPS (Transactions Per Second)',
    description: 'The number of transactions a blockchain can process each second. This is a key indicator of a blockchain\'s throughput and scalability.',
    importance: 'Higher TPS generally indicates better scalability and user experience, especially during peak usage periods. However, it should be balanced with decentralization and security considerations.',
    calculation: 'Total number of transactions processed divided by the time period in seconds. Often measured as theoretical maximum vs. actual average.',
  },
  {
    name: 'Active Addresses',
    description: 'The number of unique addresses that have participated in blockchain transactions within a specific time period (usually daily).',
    importance: 'A growing number of active addresses suggests increasing adoption and network usage. It\'s a better indicator of actual usage than total address count.',
    calculation: 'Count of unique addresses sending or receiving transactions in a given time period.',
  },
  {
    name: 'Fees',
    description: 'The total amount of transaction fees paid by users to validators/miners for processing transactions on the blockchain.',
    importance: 'Fee revenue is essential for blockchain security in the long term, especially for networks where block rewards diminish over time.',
    calculation: 'Sum of all transaction fees paid during a specific time period, usually denominated in USD.',
  },
  {
    name: 'Staking Yield',
    description: 'The annualized return earned by token holders who stake their assets to secure the network in Proof of Stake blockchains.',
    importance: 'Staking yields affect token economics and can influence investor behavior. Higher yields may attract more stakers, potentially increasing security but also affecting circulating supply.',
    calculation: 'Annual staking rewards divided by the amount staked, expressed as a percentage.',
  },
  {
    name: 'NVT Ratio (Network Value to Transactions)',
    description: 'A valuation metric that compares a blockchain\'s market capitalization to its transaction volume, similar to the P/E ratio in traditional finance.',
    importance: 'Lower NVT ratios may indicate that a blockchain is generating more transaction value relative to its market cap, potentially suggesting undervaluation.',
    calculation: 'Market Capitalization ÷ Daily Transaction Volume (in USD).',
  },
];

export default function Layer1SectorPage() {
  return (
    <div className="container py-10">
      <Link href="/sectors" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all sectors
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Layer 1 Blockchains</h1>
        <p className="text-lg text-muted-foreground">
          Base blockchain protocols that process and finalize transactions without relying on another blockchain
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics Explained</TabsTrigger>
          <TabsTrigger value="protocols">Top Protocols</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What are Layer 1 Blockchains?</CardTitle>
              <CardDescription>Base layer blockchain protocols explained</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Layer 1 blockchains are the base layer protocols that handle transaction processing, consensus, and security directly on their own blockchain. These networks operate independently and don't rely on another blockchain for security or finality.
              </p>
              <p>
                Layer 1 protocols implement their own consensus mechanisms (like Proof of Work, Proof of Stake, or variations) and have their own native tokens that are typically used for transaction fees, staking, governance, and other network activities.
              </p>
              <p>
                Examples of Layer 1 blockchains include Bitcoin, Ethereum, Solana, Avalanche, and Polkadot. Each has made different design choices regarding the blockchain trilemma of security, decentralization, and scalability.
              </p>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Key Consensus Mechanisms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Proof of Work (PoW)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Miners compete to solve complex mathematical puzzles, requiring significant computational power. The first to solve it gets to add a block and receive rewards. Examples: Bitcoin, Dogecoin.
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Proof of Stake (PoS)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Validators are selected to create new blocks based on the amount of cryptocurrency they're staking. More energy-efficient than PoW. Examples: Ethereum (post-Merge), Solana, Avalanche.
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Delegated Proof of Stake (DPoS)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Token holders vote for a limited number of delegates who validate transactions and secure the network. Examples: EOS, Tron.
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Nominated Proof of Stake (NPoS)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Token holders nominate validators they trust, and validators are selected based on these nominations. Examples: Polkadot, Kusama.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layer 1 Metrics Explained</CardTitle>
              <CardDescription>Understanding key performance indicators for Layer 1 blockchains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium flex items-center">
                      {metric.name}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>{metric.calculation}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="mt-2 text-muted-foreground">{metric.description}</p>
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-sm font-medium mb-1">Why it matters:</h4>
                      <p className="text-sm">{metric.importance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols">
          <Card>
            <CardHeader>
              <CardTitle>Top Layer 1 Protocols</CardTitle>
              <CardDescription>Key metrics for leading Layer 1 blockchains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Consensus</TableHead>
                      <TableHead>TPS</TableHead>
                      <TableHead>Active Addresses</TableHead>
                      <TableHead>24h Fees</TableHead>
                      <TableHead>Staking Yield</TableHead>
                      <TableHead>NVT Ratio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {layer1Protocols.map((protocol) => (
                      <TableRow key={protocol.name}>
                        <TableCell className="font-medium">{protocol.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{protocol.consensus}</Badge>
                        </TableCell>
                        <TableCell>{protocol.tps}</TableCell>
                        <TableCell>{protocol.activeAddresses}</TableCell>
                        <TableCell>{protocol.fees24h}</TableCell>
                        <TableCell>{protocol.stakingYield}</TableCell>
                        <TableCell>{protocol.nvtRatio}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Data is for illustrative purposes and may not reflect current market conditions. Last updated: July 7, 2025.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
