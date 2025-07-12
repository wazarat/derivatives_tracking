'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getPortfoliosFromLocalStorage, 
  deletePortfolio, 
  Portfolio,
  calculatePortfolioAPY,
  calculatePortfolioRisk
} from '../../services/portfolioService';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Share2,
  Loader2
} from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

export default function PortfoliosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioToDelete, setPortfolioToDelete] = useState<string | null>(null);

  // Load portfolios from localStorage
  useEffect(() => {
    const loadPortfolios = () => {
      try {
        const savedPortfolios = getPortfoliosFromLocalStorage();
        setPortfolios(savedPortfolios);
      } catch (error) {
        console.error('Error loading portfolios:', error);
        toast({
          title: 'Error loading portfolios',
          description: 'There was a problem loading your portfolios.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolios();
  }, [toast]);

  // Handle portfolio deletion
  const handleDeletePortfolio = (portfolioId: string) => {
    try {
      const success = deletePortfolio(portfolioId);
      if (success) {
        setPortfolios(portfolios.filter(p => p.id !== portfolioId));
        toast({
          title: 'Portfolio deleted',
          description: 'Your portfolio has been deleted successfully.'
        });
      } else {
        throw new Error('Failed to delete portfolio');
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        title: 'Error deleting portfolio',
        description: 'There was a problem deleting your portfolio.'
      });
    } finally {
      setPortfolioToDelete(null);
    }
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Portfolios</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your investment portfolios
          </p>
        </div>
        <Button onClick={() => router.push('/portfolio')}>
          <Plus className="mr-2 h-4 w-4" />
          New Portfolio
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading portfolios...</span>
        </div>
      ) : portfolios.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-medium mb-2">No portfolios yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first portfolio to start tracking your investments
            </p>
            <Button onClick={() => router.push('/portfolio')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map(portfolio => {
            const portfolioAPY = calculatePortfolioAPY(portfolio);
            const portfolioRisk = calculatePortfolioRisk(portfolio);
            
            return (
              <Card key={portfolio.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-1">{portfolio.name}</CardTitle>
                      <CardDescription>
                        {portfolio.entries.length} assets • Last updated {formatDate(portfolio.updatedAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => router.push(`/portfolios/${portfolio.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setPortfolioToDelete(portfolio.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {portfolio.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {portfolio.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Expected APY</div>
                      <div className="text-xl font-bold text-green-600">
                        {portfolioAPY !== null ? `${(portfolioAPY * 100).toFixed(2)}%` : '-'}
                      </div>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                      <div className="text-xl font-bold">
                        {portfolioRisk !== null ? portfolioRisk.toFixed(1) : '-'}/5
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/portfolios/${portfolio.id}`)}
                  >
                    View & Edit
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ display: portfolioToDelete ? 'flex' : 'none' }}>
        <div className="bg-white rounded-lg p-8 w-96">
          <h2 className="text-lg font-bold mb-2">Are you sure?</h2>
          <p className="text-muted-foreground mb-6">
            This will permanently delete this portfolio. This action cannot be undone.
          </p>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setPortfolioToDelete(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              className="ml-2"
              onClick={() => portfolioToDelete && handleDeletePortfolio(portfolioToDelete)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
