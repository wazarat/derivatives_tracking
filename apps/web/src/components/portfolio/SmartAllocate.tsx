'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '@/services/assetService';
import { 
  generateSmartAllocation, 
  RiskPreference, 
  InvestmentGoal, 
  InvestmentHorizon,
  AllocationResponse
} from '@/services/smartAllocateService';
import { savePortfolioToLocalStorage } from '@/services/portfolioService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export function SmartAllocate() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [riskPreference, setRiskPreference] = useState<RiskPreference>(RiskPreference.Moderate);
  const [investmentGoal, setInvestmentGoal] = useState<InvestmentGoal>(InvestmentGoal.BalancedGrowth);
  const [investmentHorizon, setInvestmentHorizon] = useState<InvestmentHorizon>(InvestmentHorizon.MediumTerm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<AllocationResponse | null>(null);
  
  // Fetch available assets
  const { data: assetResponse, isLoading: isLoadingAssets, error: assetsError } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(),
  });

  // Extract the actual asset array from the response
  const assets = assetResponse?.data || [];

  // Handle form submission
  const handleGenerateAllocation = async () => {
    if (!assets || assets.length === 0) {
      toast({
        title: 'No assets available',
        description: 'Cannot generate allocation without available assets',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setAllocation(null);

    try {
      const result = await generateSmartAllocation({
        availableAssets: assets,
        riskPreference,
        investmentGoal,
        investmentHorizon,
      });

      setAllocation(result);
      toast({
        title: 'Portfolio generated',
        description: 'Smart allocation has been generated successfully',
      });
    } catch (error) {
      console.error('Error generating allocation:', error);
      setGenerationError('Failed to generate allocation. Please try again.');
      toast({
        title: 'Generation failed',
        description: 'There was an error generating your portfolio allocation',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save the generated portfolio
  const handleSavePortfolio = () => {
    if (!allocation) return;

    try {
      savePortfolioToLocalStorage(allocation.portfolio);
      toast({
        title: 'Portfolio saved',
        description: 'Your smart portfolio has been saved successfully',
      });
      router.push('/portfolios');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: 'Error saving portfolio',
        description: 'There was a problem saving your portfolio',
        variant: 'destructive',
      });
    }
  };

  // Handle loading state
  if (isLoadingAssets) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading assets...</span>
      </div>
    );
  }

  // Handle error state
  if (assetsError) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-destructive mb-2">Failed to load assets</h3>
        <p className="text-muted-foreground">
          There was a problem loading the available assets. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preferences Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Allocate
          </CardTitle>
          <CardDescription>
            Let AI generate an optimal portfolio allocation based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Preference */}
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <Label className="text-base font-medium">Risk Preference</Label>
              <InfoTooltip term="Risk Preference" context="Smart Allocate" />
            </div>
            <RadioGroup
              value={riskPreference}
              onValueChange={(value) => setRiskPreference(value as RiskPreference)}
              className="grid grid-cols-1 md:grid-cols-5 gap-2"
            >
              <Label
                htmlFor="very_conservative"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  riskPreference === RiskPreference.VeryConservative ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={RiskPreference.VeryConservative}
                  id="very_conservative"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Very Conservative</span>
              </Label>
              <Label
                htmlFor="conservative"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  riskPreference === RiskPreference.Conservative ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={RiskPreference.Conservative}
                  id="conservative"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Conservative</span>
              </Label>
              <Label
                htmlFor="moderate"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  riskPreference === RiskPreference.Moderate ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={RiskPreference.Moderate}
                  id="moderate"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Moderate</span>
              </Label>
              <Label
                htmlFor="aggressive"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  riskPreference === RiskPreference.Aggressive ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={RiskPreference.Aggressive}
                  id="aggressive"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Aggressive</span>
              </Label>
              <Label
                htmlFor="very_aggressive"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  riskPreference === RiskPreference.VeryAggressive ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={RiskPreference.VeryAggressive}
                  id="very_aggressive"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Very Aggressive</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Investment Goal */}
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <Label className="text-base font-medium">Investment Goal</Label>
              <InfoTooltip term="Investment Goal" context="Smart Allocate" />
            </div>
            <RadioGroup
              value={investmentGoal}
              onValueChange={(value) => setInvestmentGoal(value as InvestmentGoal)}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2"
            >
              <Label
                htmlFor="capital_preservation"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentGoal === InvestmentGoal.CapitalPreservation ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentGoal.CapitalPreservation}
                  id="capital_preservation"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Capital Preservation</span>
              </Label>
              <Label
                htmlFor="income"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentGoal === InvestmentGoal.Income ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentGoal.Income}
                  id="income"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Income</span>
              </Label>
              <Label
                htmlFor="balanced_growth"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentGoal === InvestmentGoal.BalancedGrowth ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentGoal.BalancedGrowth}
                  id="balanced_growth"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Balanced Growth</span>
              </Label>
              <Label
                htmlFor="growth"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentGoal === InvestmentGoal.Growth ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentGoal.Growth}
                  id="growth"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Growth</span>
              </Label>
              <Label
                htmlFor="maximum_growth"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentGoal === InvestmentGoal.MaximumGrowth ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentGoal.MaximumGrowth}
                  id="maximum_growth"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Maximum Growth</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Investment Horizon */}
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <Label className="text-base font-medium">Investment Horizon</Label>
              <InfoTooltip term="Investment Horizon" context="Smart Allocate" />
            </div>
            <RadioGroup
              value={investmentHorizon}
              onValueChange={(value) => setInvestmentHorizon(value as InvestmentHorizon)}
              className="grid grid-cols-1 md:grid-cols-3 gap-2"
            >
              <Label
                htmlFor="short_term"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentHorizon === InvestmentHorizon.ShortTerm ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentHorizon.ShortTerm}
                  id="short_term"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Short Term</span>
                <span className="text-xs text-muted-foreground">Less than 1 year</span>
              </Label>
              <Label
                htmlFor="medium_term"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentHorizon === InvestmentHorizon.MediumTerm ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentHorizon.MediumTerm}
                  id="medium_term"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Medium Term</span>
                <span className="text-xs text-muted-foreground">1-3 years</span>
              </Label>
              <Label
                htmlFor="long_term"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  investmentHorizon === InvestmentHorizon.LongTerm ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem
                  value={InvestmentHorizon.LongTerm}
                  id="long_term"
                  className="sr-only"
                />
                <span className="text-sm font-medium">Long Term</span>
                <span className="text-xs text-muted-foreground">3+ years</span>
              </Label>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateAllocation} 
            disabled={isGenerating || !assets || assets.length === 0}
            className="w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Smart Allocation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Generation Error */}
      {generationError && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">{generationError}</p>
          </div>
        </div>
      )}

      {/* Generated Allocation */}
      {allocation && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Portfolio</CardTitle>
            <CardDescription>
              AI-generated allocation based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Portfolio Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Expected APY</div>
                <div className="text-2xl font-bold text-green-600">
                  {(allocation.expectedApy * 100).toFixed(2)}%
                </div>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                <div className="text-2xl font-bold">
                  {allocation.riskScore.toFixed(1)}/5
                </div>
              </div>
            </div>

            {/* Allocation Reasoning */}
            <div>
              <h3 className="text-lg font-medium mb-2">Allocation Strategy</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {allocation.reasoning}
              </p>
            </div>

            {/* Asset Allocation */}
            <div>
              <h3 className="text-lg font-medium mb-2">Asset Allocation</h3>
              <div className="space-y-2">
                {allocation.portfolio.entries.map((entry) => (
                  <div 
                    key={entry.assetId} 
                    className="flex items-center justify-between p-3 bg-card border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-full min-h-[2rem] rounded-full"
                        style={{ 
                          backgroundColor: `hsl(${parseInt(entry.assetId, 16) % 360}, 70%, 50%)`,
                          opacity: 0.7
                        }}
                      />
                      <div>
                        <div className="font-medium">{entry.asset.name}</div>
                        <div className="text-sm text-muted-foreground">{entry.asset.ticker}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold">{entry.allocation.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {allocation.recommendations && allocation.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {allocation.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleSavePortfolio}
              className="w-full sm:w-auto"
            >
              Save Portfolio
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGenerateAllocation}
              className="w-full sm:w-auto"
            >
              Regenerate
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
