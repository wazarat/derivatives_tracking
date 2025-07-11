import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp, 
  LineChart, 
  BarChart3, 
  PieChart,
  Star,
  Plus
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export const metadata: Metadata = {
  title: 'Dashboard - CanHav',
  description: 'Your crypto analytics dashboard',
};

export default async function DashboardPage() {
  const { userId } = auth();
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Mock data for UI demonstration
  const marketOverview = {
    btcPrice: 67432.58,
    btcChange: 2.34,
    ethPrice: 3245.67,
    ethChange: -1.23,
    totalMarketCap: 2.45, // In trillions
    marketCapChange: 1.56,
    volume24h: 98.7, // In billions
    volumeChange: -3.21,
  };
  
  const watchlist = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 67432.58, change24h: 2.34 },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3245.67, change24h: -1.23 },
    { id: 3, name: 'Solana', symbol: 'SOL', price: 143.21, change24h: 5.67 },
    { id: 4, name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: -0.78 },
    { id: 5, name: 'Polkadot', symbol: 'DOT', price: 6.78, change24h: 3.45 },
  ];
  
  const portfolio = {
    totalValue: 12567.89,
    dailyChange: 345.67,
    dailyChangePercent: 2.83,
    assets: [
      { name: 'Bitcoin', symbol: 'BTC', allocation: 45, value: 5655.55 },
      { name: 'Ethereum', symbol: 'ETH', allocation: 30, value: 3770.37 },
      { name: 'Solana', symbol: 'SOL', allocation: 15, value: 1885.18 },
      { name: 'Other', symbol: '', allocation: 10, value: 1256.79 },
    ],
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Dashboard Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="container px-4 py-6 md:px-6 md:py-8">
        {/* Market Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bitcoin (BTC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">${marketOverview.btcPrice.toLocaleString()}</div>
                  <div className={`flex items-center ${marketOverview.btcChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {marketOverview.btcChange >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {Math.abs(marketOverview.btcChange)}%
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ethereum (ETH)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">${marketOverview.ethPrice.toLocaleString()}</div>
                  <div className={`flex items-center ${marketOverview.ethChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {marketOverview.ethChange >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {Math.abs(marketOverview.ethChange)}%
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Market Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">${marketOverview.totalMarketCap.toLocaleString()}T</div>
                  <div className={`flex items-center ${marketOverview.marketCapChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {marketOverview.marketCapChange >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {Math.abs(marketOverview.marketCapChange)}%
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">${marketOverview.volume24h.toLocaleString()}B</div>
                  <div className={`flex items-center ${marketOverview.volumeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {marketOverview.volumeChange >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {Math.abs(marketOverview.volumeChange)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="watchlist" className="space-y-4">
          <TabsList>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>
          
          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Watchlist</h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Asset
              </Button>
            </div>
            
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Price</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">24h Change</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map((asset) => (
                      <tr key={asset.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{asset.name}</span>
                            <span className="text-muted-foreground">{asset.symbol}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          ${asset.price.toLocaleString()}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <span className={`inline-flex items-center ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {asset.change24h >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                            {Math.abs(asset.change24h)}%
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link href={`/metrics/${asset.symbol.toLowerCase()}`}>
                            <Button variant="ghost" size="sm">
                              <LineChart className="h-4 w-4 mr-1" /> View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Portfolio</h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Transaction
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Value</CardTitle>
                  <CardDescription>Total value of your crypto assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
                  <div className={`flex items-center mt-2 ${portfolio.dailyChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolio.dailyChangePercent >= 0 ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    ${Math.abs(portfolio.dailyChange).toLocaleString()} ({Math.abs(portfolio.dailyChangePercent)}%) Today
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/portfolio">
                    <Button variant="outline" size="sm">
                      View Details <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Distribution of your portfolio</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[200px]">
                  <PieChart className="h-32 w-32 text-primary opacity-70" />
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">Asset</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Allocation</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.assets.map((asset) => (
                      <tr key={asset.name} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{asset.name}</span>
                            {asset.symbol && <span className="text-muted-foreground">{asset.symbol}</span>}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          {asset.allocation}%
                        </td>
                        <td className="p-4 align-middle text-right">
                          ${asset.value.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Market Overview</h2>
              <Link href="/metrics">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" /> All Metrics
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                  <CardDescription>7-day market performance</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[200px]">
                  <LineChart className="h-32 w-32 text-primary opacity-70" />
                </CardContent>
                <CardFooter>
                  <Link href="/metrics">
                    <Button variant="outline" size="sm">
                      View Details <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sector Performance</CardTitle>
                  <CardDescription>Performance by sector</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[200px]">
                  <BarChart3 className="h-32 w-32 text-primary opacity-70" />
                </CardContent>
                <CardFooter>
                  <Link href="/research">
                    <Button variant="outline" size="sm">
                      View Research <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
