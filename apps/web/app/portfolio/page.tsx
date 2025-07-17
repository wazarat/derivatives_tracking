'use client';


import { 
  ArrowUpRight, 
  DollarSign, 
  Edit,
  PieChart, 
  Plus,
  RefreshCw, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Shield
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { usePortfolio } from "../../src/hooks/usePortfolio";
import { AddTradeDialog } from "../../src/components/portfolio/AddTradeDialog";
import { formatCurrency, formatPercent } from "../../src/utils/formatters";

export default function PortfolioPage() {
  const { portfolio, loading, error, getPortfolioStats, refetch } = usePortfolio();
  const stats = getPortfolioStats();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error loading portfolio: {error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <div className="flex items-center space-x-2">
            <AddTradeDialog 
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trade
                </Button>
              }
            />
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCurrentValue)}</div>
              <p className="text-xs text-muted-foreground">
                {portfolio.length} positions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                stats.totalPnl >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(stats.totalPnl)}
              </div>
              <p className={`text-xs flex items-center ${
                stats.totalPnl >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stats.totalPnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercent(stats.totalPnlPercentage)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPositions}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.longPositions} long, {stats.shortPositions} short
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allocation</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolio.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active positions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trades Table */}
        <Tabs defaultValue="positions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Positions</CardTitle>
                <CardDescription>
                  Track your current derivatives positions and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{position.symbol.substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{position.symbol}</p>
                          <p className="text-sm text-gray-500">{position.position_side} • {position.position_size} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency((position.current_price || position.entry_price) * position.position_size)}</p>
                        <p className={`text-sm ${
                          (position.unrealized_pnl || 0) >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {(position.unrealized_pnl || 0) >= 0 ? "+" : ""}{formatCurrency(position.unrealized_pnl || 0)} ({formatPercent(position.unrealized_pnl_percentage || 0)})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Entry: {formatCurrency(position.entry_price)}</p>
                        <p className="text-sm text-gray-500">Current: {formatCurrency(position.current_price || position.entry_price)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {portfolio.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No positions in your portfolio yet.</p>
                      <AddTradeDialog 
                        trigger={
                          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Trade
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>
                  View all your past trades and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">Trade history coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


      </div>
    </div>
  );
}
