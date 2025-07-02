import { OpenAI } from 'openai';
import { Asset } from '@/types/assets';
import { Portfolio } from '@/services/portfolioService';

// Define the risk preference levels
export enum RiskPreference {
  VeryConservative = 'very_conservative',
  Conservative = 'conservative',
  Moderate = 'moderate',
  Aggressive = 'aggressive',
  VeryAggressive = 'very_aggressive',
}

// Define the investment goals
export enum InvestmentGoal {
  CapitalPreservation = 'capital_preservation',
  Income = 'income',
  BalancedGrowth = 'balanced_growth',
  Growth = 'growth',
  MaximumGrowth = 'maximum_growth',
}

// Define the investment horizon
export enum InvestmentHorizon {
  ShortTerm = 'short_term', // < 1 year
  MediumTerm = 'medium_term', // 1-3 years
  LongTerm = 'long_term', // 3+ years
}

// Define the allocation request parameters
export interface AllocationRequest {
  availableAssets: Asset[];
  riskPreference: RiskPreference;
  investmentGoal: InvestmentGoal;
  investmentHorizon: InvestmentHorizon;
  existingPortfolio?: Portfolio;
  constraints?: {
    minAssets?: number;
    maxAssets?: number;
    includedAssetIds?: string[];
    excludedAssetIds?: string[];
    minAllocationPerAsset?: number;
    maxAllocationPerAsset?: number;
  };
}

// Define the allocation response
export interface AllocationResponse {
  portfolio: Portfolio;
  reasoning: string;
  riskScore: number;
  expectedApy: number;
  recommendations: string[];
}

/**
 * Generate a smart allocation recommendation using OpenAI
 * @param request The allocation request parameters
 * @returns A promise that resolves to the allocation response
 */
export async function generateSmartAllocation(
  request: AllocationRequest
): Promise<AllocationResponse> {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    // Prepare asset data for the OpenAI function call
    const assetData = request.availableAssets.map(asset => ({
      id: asset.id,
      name: asset.name,
      ticker: asset.ticker,
      sector: asset.sector,
      risk_tier: asset.risk_tier,
      risk_score: asset.risk_score,
      apy: asset.market_data?.apy || 0,
      volatility: asset.market_data?.volatility_30d || 0,
      max_drawdown: asset.market_data?.max_drawdown_30d || 0,
      description: asset.description || '',
    }));

    // Make the OpenAI function call
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert crypto investment advisor specializing in portfolio allocation. 
          Your task is to create an optimal portfolio allocation based on the user's risk preference, 
          investment goals, and time horizon. Consider the risk scores, APY, volatility, and other 
          metrics of the available assets. Provide a well-reasoned allocation with percentages that 
          sum to 100%. Focus on creating a diversified portfolio that matches the user's risk profile.`
        },
        {
          role: "user",
          content: `Create a portfolio allocation with the following parameters:
          - Risk preference: ${request.riskPreference}
          - Investment goal: ${request.investmentGoal}
          - Investment horizon: ${request.investmentHorizon}
          ${request.constraints ? `- Constraints: ${JSON.stringify(request.constraints)}` : ''}
          
          Available assets: ${JSON.stringify(assetData)}`
        }
      ],
      functions: [
        {
          name: "create_portfolio_allocation",
          description: "Create an optimal portfolio allocation based on the given parameters",
          parameters: {
            type: "object",
            properties: {
              allocations: {
                type: "array",
                description: "Array of asset allocations",
                items: {
                  type: "object",
                  properties: {
                    asset_id: {
                      type: "string",
                      description: "ID of the asset"
                    },
                    allocation_percentage: {
                      type: "number",
                      description: "Percentage allocation (0-100)"
                    }
                  },
                  required: ["asset_id", "allocation_percentage"]
                }
              },
              reasoning: {
                type: "string",
                description: "Explanation of the allocation strategy and rationale"
              },
              expected_risk_score: {
                type: "number",
                description: "Expected composite risk score of the portfolio (0-5)"
              },
              expected_apy: {
                type: "number",
                description: "Expected APY of the portfolio as a decimal (e.g., 0.05 for 5%)"
              },
              recommendations: {
                type: "array",
                description: "Additional recommendations or insights",
                items: {
                  type: "string"
                }
              }
            },
            required: ["allocations", "reasoning", "expected_risk_score", "expected_apy", "recommendations"]
          }
        }
      ],
      function_call: { name: "create_portfolio_allocation" },
      temperature: 0.5,
    });

    // Extract the function call result
    const functionCall = response.choices[0]?.message?.function_call;
    
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Failed to get allocation from OpenAI");
    }

    // Parse the function call arguments
    const args = JSON.parse(functionCall.arguments);
    
    // Create a portfolio from the allocations
    const portfolio: Portfolio = {
      name: `Smart Portfolio - ${new Date().toLocaleDateString()}`,
      description: `Auto-generated portfolio based on ${request.riskPreference} risk preference and ${request.investmentGoal} goal`,
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    };

    // Add assets to the portfolio with the recommended allocations
    for (const allocation of args.allocations) {
      const asset = request.availableAssets.find(a => a.id === allocation.asset_id);
      if (asset) {
        portfolio.entries.push({
          assetId: asset.id,
          asset,
          allocation: allocation.allocation_percentage,
          weight: allocation.allocation_percentage / 100,
        });
      }
    }

    // Return the allocation response
    return {
      portfolio,
      reasoning: args.reasoning,
      riskScore: args.expected_risk_score,
      expectedApy: args.expected_apy,
      recommendations: args.recommendations,
    };
  } catch (error) {
    console.error('Error generating smart allocation:', error);
    throw new Error('Failed to generate smart allocation');
  }
}
